/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        DefaultDialogs  = brackets.getModule("widgets/DefaultDialogs"),
        Omnisharp = require('modules/omnisharp'),
        Helpers = require('modules/helpers'),
        FileUtils = brackets.getModule('file/FileUtils');

    var $input;

    function onClose(buttonId) {
        var renameTo = $input.val();

        if (buttonId === 'renameOk' && renameTo !== undefined) {
            var data = Helpers.buildRequest();
            data.renameto = renameTo;

            Omnisharp.makeRequest('rename', data, function (err, data) {
                data.Changes.forEach(function (change) {
                    var unixPath = FileUtils.convertWindowsPathToUnixPath(change.FileName);
                    DocumentManager.getDocumentForPath(unixPath).done(function (document) {
                        document.setText(change.Buffer);
                    });
                });
            });
        }
    }

    function exec() {
        Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_SAVE_CLOSE,
            'Rename',
            '<input style="margin-bottom:-18px;" type="text" id="renameInput" />',
            [
                { className: 'primary', id: 'renameOk', text: 'Ok' },
                { className: 'left', id: 'renameCancel', text: 'Cancel' }
            ],
            true
        ).done(onClose);

        $input = $('#renameInput');
        var oldName = EditorManager.getCurrentFullEditor().getSelectedText();
        $input.val(oldName);
        $input.focus();
        $input.select();
        $input.keyup(function (event) {
            if (event.keyCode === 13) {
                Dialogs.cancelModalDialogIfOpen(
                    DefaultDialogs.DIALOG_ID_SAVE_CLOSE,
                    'renameOk'
                );
            }
        });
    }

    exports.exec = exec;
});