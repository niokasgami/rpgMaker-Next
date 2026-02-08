/*: ==========================================================================
* ############################################################################
*
* Plugin: dek-rm-splitter.js
* Author: DekitaRPG [dekitarpg.com] (dekitarpg@gmail.com)
*
* ############################################################################
* ============================================================================
* 1- make sure you have node.js v11.0.0 or newer installed on your machine
* 2- save this file into the /.js folder of your rpg maker mv/mz project.
*  - make sure the file is called 'dek-rm-splitter.js'.
* 3- open a command terminal window in the js directory.
* 4- run the command 'node dek-rm-splitter.js'
*/

//============================================================================
// configuration::start
//============================================================================

// define the folder you want your split files to save into
const split_folder = 'splits';

// define the engine you are using, either MV or MZ
const split_engine = 'MZ';

// define the wait in between file saves
const split_wait   = 0; //ms, can be 0

// define if unknown files can be saved
const save_unknown = false;

//============================================================================
// configuration::end
//============================================================================

// NOTE: do not edit below unless you know what you are doing!!
const fs = require('fs');
const path = require('path');
const mainsplitter = /\/\/-{69,}/;
const class_regexp = /(function) \w+/;
const namsp_regexp = /@namespace (\w+)/;
const splitfolder = path.join('.', split_folder);

const log = (...argz) => console.log(...argz);
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const mkdir = p => !fs.existsSync(p) ? fs.mkdirSync(p) : null;

(async()=>{
  log('#scanning-for-rm-files:..');
  const dirfiles = fs.readdirSync('.');
  const rm_files = dirfiles.filter(f => {
    const type = split_engine === 'MZ' ? 'rmmz_' : 'rpg_';
    return f.startsWith(type) && f.endsWith('.js')
  });

  log('#ensuring-split-dir-exists:..');
  mkdir(splitfolder);

  function scanForClassName(maybeclass, index) {
    const classmatch = maybeclass.match(class_regexp);
    if (classmatch) return classmatch[0].replace('function','').trim();
    const namesmatch = maybeclass.match(namsp_regexp);
    if (namesmatch) return namesmatch[0].replace('@namespace','').trim();
    return save_unknown ? `unknown-file-${index}` : null;
  }

  try {
    for (const filename of rm_files) {
      log('#reading-rm-file:', filename);
      const readpath = path.join('.', filename);
      const filedata = await fs.promises.readFile(readpath, 'utf8');
      const split_classes = filedata.split(mainsplitter);
      for (const [i, maybeclass] of split_classes.entries()) {
        if (split_wait) await wait(split_wait);
        const tempname = filename.replace('.js','');
        const classname = scanForClassName(maybeclass, i);
        if (classname === null) continue;
        const module_dir = path.join('.', `/${split_folder}/${tempname}`);
        mkdir(module_dir); // ensures module directory exists
        const newfilepath = path.join(module_dir, `${classname}.js`);
        await fs.promises.writeFile(newfilepath, maybeclass);
        log('wrote:', newfilepath);
      }
    }
  } catch (error){
    log('#cant-split-files!!');
    throw error;
  }
})();
