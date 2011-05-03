VIE widgets
===========

This repository will contain higher-level widgets for using VIE and VIE^2 in web applications and content management systems.

Editable
--------

Make content on a page editable via VIE and [Aloha Editor](http://aloha-editor.org/). The widget assumes you have jQuery, jQuery UI, Aloha Editor and VIE loaded.

Usage:

    jQuery('[about]').editable();

The VIE editable widget provides several events that your application can use for interacting with the content.

* enable: Editables have been enabled
* enableproperty: A particular property has been made editable
* disable: Editables have been disabled
* activated: A particular property editable has been activated
* deactivated: A particular property editable has been deactivated
* changed: User has modified contents of a property

Example, autosaving changed contents:

     jQuery('[about]').bind('editablechanged', function(event, data) {
         data.instance.save();
     });
