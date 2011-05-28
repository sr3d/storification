Link
====
The demo can be accessed at:  http://sr3d.github.com/storification/


Features
========
- Mobile version for Storify Homepage using jQueryMobile.
- 100% front-end only.
- Homepage data is pulled from http://storify.com/storifyfeatured/homepage.json
- Additional story is pulled and rendered inline in the same page.  Due to a bug in jQueryMobile, the back-button won't work without a clunky hack (around line ~197 in storification.js)
- Basic support for different content elements:  text, website, video (YouTube), Tweet, and any other types of content will be rendered using a generic template.

Verdicts:  jQueryMobile is still a pretty alpha state.  For the navigation bug, probably we need a backend script to pull the data and feed the page using AJAX, instead of doing everything in one-page like now.  jQueryMobile doesn't do so well with multiple sub-pages within one file.