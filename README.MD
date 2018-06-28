# semantic-ui-css-offline
## Semantic-UI Version 2.3.2
semantic-ui-css-offline package provides Semantic UI CSS style sheet and static files, like fonts and icons.
It uses gulp to download and build the newest version of CSS. Additionally modifies build settings of Semantic UI to turn off google fonts and adds a newer version of Loto font, to support offline usage and better unicode character support.

It was created to use with "Semantic UI React" inside "create-react-app". It should work with any configuration if your module bundler have proper support.


## install

```npm install --save semantic-ui-css-offline```


## usage is module bundler (Like Webpack)

At the level of your project
```JavaScript
import 'semantic-ui-css-offline'
```


##  Do you want newer version of Semantic-UI?

* clone repo
* run ```npm install gulp -g```
* run ```npm install```
* run ```gulp```
* Use foulders ```fonts``` ```themes``` and file ```semantic.min.css``` four your project.


License
----

MIT
