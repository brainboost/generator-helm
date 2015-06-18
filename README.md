# generator-helm

Generates a starting point for a Knockout-based web-application. Can be used to generate pages and custom components on the site. Based on the Steven Sanderson's generator-ko, with improvements by techmuch whose repository generator-huddle has been forked to this one. Strictly speaking, this repository is just a customization for changing paths and templates.
To install using bower, type in the root directory of the site:
```
  bower install https://github.com/brainboost/generator-helm.git --save-dev
```
Then, you'll need to link and add the generator to the yeoman's generator list. In the directory of just installed generator-helm and run
```
  npm link
```
So, the generator 'helm' should be in the list of yeoman generators:
```
  yo --generators
```
# Usage
```
  yo helm:page <pagename>
```
creates a page in the scripts/app/pages directory and add registration and routing rules
```
  yo helm:component <name>
```
creates a component in the scripts/app/components directory and register it as a knockout component.
