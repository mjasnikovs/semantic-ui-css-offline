const fs = require('fs')
const spawn = require('child_process').spawn
const {resolve} = require('path')
const endOfLine = require('os').EOL

const gulp = require('gulp')
const download = require('gulp-download')
const unzip = require('gulp-unzip')
const sequence = require('run-sequence')
const clean = require('gulp-clean')
const {merge} = require('event-stream')

const TEMP_DIR = resolve('./temp')
const DIST_DIR = resolve('./')
const SRC_DIR = resolve('./src')

gulp.task('pre-clean', () => {
	const args = [TEMP_DIR, resolve('./fonts'), resolve('./themes'), resolve('./semantic.min.css')]
	return gulp.src(args, {read: false})
		.pipe(clean())
})

gulp.task('download-sem', () => {
	return download('https://github.com/Semantic-Org/Semantic-UI/archive/master.zip')
		.pipe(gulp.dest(resolve(TEMP_DIR)))
})

gulp.task('unzip-sem', () => {
	return gulp.src(resolve('./temp/master.zip'))
		.pipe(unzip())
		.pipe(gulp.dest(TEMP_DIR))
})

gulp.task('npm-is-garbage-use-yarn', () => {
	return gulp.src(resolve(`${TEMP_DIR}/Semantic-UI-master/package-lock.json`), {read: false})
		.pipe(clean())
})

gulp.task('install-sem', done => {
	const projectDir = resolve(`${TEMP_DIR}/Semantic-UI-master`)
	const args = ['--prefix', projectDir, 'install', projectDir, '--ignore-scripts', '--unsafe-perm=true']

	spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', args, {
		cwd: process.cwd(),
		stdio: 'inherit'
	}).on('exit', (code, signal) => {
		if (code === 0) {
			return done()
		}
		return done(code, signal)
	}).on('error', done)
})

gulp.task('install-sem-gulp', done => {
	const projectDir = resolve(`${TEMP_DIR}/Semantic-UI-master`)
	const args = ['--gulpfile', `${projectDir}/gulpfile.js`, '--cwd', projectDir, 'install']

	const gulpProcess = spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', args, {
		cwd: process.cwd()
	}).on('exit', (code, signal) => {
		if (code === 0) {
			return done()
		}
		return done(code, signal)
	}).on('error', done)

	gulpProcess.stdout.on('data', () => gulpProcess.stdin.write(endOfLine))
})

gulp.task('set-google-fonts-false', done => {
	const importFile = resolve(`${TEMP_DIR}/Semantic-UI-master/src/site/globals/site.variables`)

	fs.access(importFile, fs.constants.W_OK, err => {
		if (err) {
			return done(`${err} is not writable`)
		}

		fs.appendFile(importFile, `${endOfLine}@importGoogleFonts: false;${endOfLine}`, error => {
			if (error) {
				return done(err)
			}
			return done()
		})
	})
})

gulp.task('set-fonts-extension', done => {
	const importFile = resolve(`${TEMP_DIR}/Semantic-UI-master/src/site/globals/site.overrides`)
	const cssFile = resolve('./src/fontsExtension.css')

	fs.access(importFile, fs.constants.W_OK, err => {
		if (err) {
			return done(`${err} is not writable`)
		}

		fs.readFile(cssFile, 'utf-8', (error, data) => {
			if (error) {
				return done(`${error} is not readable`)
			}

			fs.appendFile(importFile, `${endOfLine}${data}${endOfLine}`, erro => {
				if (erro) {
					return done(erro)
				}
				return done()
			})
		})
	})
})

gulp.task('build-sem', done => {
	const projectDir = resolve(`${TEMP_DIR}/Semantic-UI-master`)
	const args = ['--gulpfile', `${projectDir}/gulpfile.js`, '--cwd', projectDir, 'build']

	spawn(/^win/.test(process.platform) ? 'gulp.cmd' : 'gulp', args, {
		cwd: process.cwd()
	}).on('exit', (code, signal) => {
		if (code === 0) {
			return done()
		}
		return done(code, signal)
	}).on('error', done)
})

gulp.task('build-dist', done => {
	const projectDir = resolve(`${TEMP_DIR}/Semantic-UI-master`)

	return merge(
		gulp.src(`${projectDir}/dist/themes/**/*`)
			.pipe(gulp.dest(`${DIST_DIR}/themes`)),
		gulp.src(`${projectDir}/dist/semantic.min.css`)
			.pipe(gulp.dest(`${DIST_DIR}/`)),
		gulp.src(`${SRC_DIR}/fonts/**/*`)
			.pipe(gulp.dest(`${DIST_DIR}/fonts`))
	)
})

gulp.task('clean', () => {
	return gulp.src(TEMP_DIR, {read: false})
		.pipe(clean())
})

gulp.task('default', done => {
	return sequence(
		'pre-clean',
		'download-sem',
		'unzip-sem',
		'npm-is-garbage-use-yarn',
		'install-sem',
		'install-sem-gulp',
		'set-google-fonts-false',
		'set-fonts-extension',
		'build-sem',
		'build-dist',
		'clean',
		done)
})
