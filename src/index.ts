import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './request';

/**
 * Initialization data for the @stellarshenson/jupyterlab-advanced-code-viewer-extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@stellarshenson/jupyterlab-advanced-code-viewer-extension:plugin',
  description:
    'Follow a notebook or a source file while an AI agent writes it, see each change in the editor as you work, and mark and comment on code with notes stored in the file',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null
  ) => {
    console.log(
      'JupyterLab extension @stellarshenson/jupyterlab-advanced-code-viewer-extension is activated!'
    );

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log(
            'jupyterlab_advanced_code_viewer_extension settings loaded:',
            settings.composite
          );
        })
        .catch(reason => {
          console.error(
            'Failed to load settings for jupyterlab_advanced_code_viewer_extension.',
            reason
          );
        });
    }

    requestAPI<any>('hello', app.serviceManager.serverSettings)
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The jupyterlab_advanced_code_viewer_extension server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
