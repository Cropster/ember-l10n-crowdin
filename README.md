ember-l10n-crowdin
==============================================================================

Manage translations files from ember-l10n with Crowdin.

[![Build Status](https://travis-ci.org/Cropster/ember-l10n-crowdin.svg?branch=master)](https://travis-ci.org/Cropster/ember-l10n-crowdin)
[![Ember Observer Score](https://emberobserver.com/badges/ember-l10n-crowdin.svg)](https://emberobserver.com/addons/ember-l10n-crowdin)
[![npm version](https://badge.fury.io/js/ember-l10n-crowdin.svg)](https://badge.fury.io/js/ember-l10n-crowdin)


Compatibility
------------------------------------------------------------------------------

* Node 8 and above


Installation
------------------------------------------------------------------------------

```bash
ember install ember-l10n-crowdin
```

Usage
------------------------------------------------------------------------------

```bash
ember crowdin:pull
ember crowdin:push
```

Make sure to update the `config/crowdin.js` file with the correct configuration for your project.

### crowdin:pull

Pull translations from Crowdin, and update the `_locale_.po` files locally.

Options:

* `project`: The project ID on Crowdin
* `api-key`: The API key for this Crowdin project
* `crowdin-folder-name`: The folder name for the export from Crowdin. See "Crowdin Setup" for details on this
* `translations-dir`: The local directory where translation files are stored. Default: `./translations`
* `locale`: One or multiple locales to download. If not set, all locales will be overwritten.

Example usages:

```bash
ember crowdin:pull # Pull all translations
ember crowdin:pull --locale de # Only pull German
ember crowdin:pull --locale de --locale es # Pull German and Spanish
```

### crowdin:push

Push the translation source file to Crowdin, and update it there.

Options:

* `project`: The project ID on Crowdin
* `api-key`: The API key for this Crowdin project
* `crowdin-file-name`: The file name for the translation file on Crowdin
* `translations-dir`: The local directory where translation files are stored. Default: `./translations`
* `translations-file`: The local file name for the translation source file. Default: `messages.pot`

Example usages:

```bash
ember crowdin:push # Push file as configured in config/crowdin.js
```

Crowdin Setup
------------------------------------------------------------------------------

You will need to ensure the export filenames for your project are setup correctly in Crowdin.

To do that, go to your Project > Settings > Files.

Then, double click on the file that maps to your ember-l10n project.

In the field "Resulting file name when exported", enter something like this:

`/my-project-name/%locale_with_underscore%.po`

Where `my-project-name` would be what needs to be set as `crowdinFolderName` option.

For the default options (from the auto-generated `config/crowdin.js` file), you would need the following settings:

* Make sure the source file is uploaded as `messages.pot`
* Set the "Resulting file name when exported" to `/messages/%locale_with_underscore%.po`

You can configure the "locale_with_underscore" settings for the locales in Crowdin via Project > Settings > General Settings > Add custom language codes > Language Mapping.

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
