import $ = require("jquery");
import ko = require("knockout");
import bootstrap = require("bootstrap");
import router = require("./router");

// Components can be packaged as AMD modules, such as the following:
ko.components.register('nav-bar', { require: 'components/nav-bar/nav-bar' });
ko.components.register('home-page', { require: 'components/home-page/home' });

// ... or for template-only components, you can just point to a .html file directly:
ko.components.register('about-page', {
  template: { require: 'text!components/about-page/about.html' }
});

ko.components.register('cadviewer', { require: 'standard_components/cadviewer/cadviewer' });

ko.components.register('scatter-plot', { require: 'standard_components/scatter-plot/scatter-plot' });

ko.components.register('datatable', { require: 'standard_components/datatable/datatable' });

// [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

// Start the application
ko.applyBindings({ route: router.currentRoute });
