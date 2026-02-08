/*:
 * @pluginname gear-tools
 * @plugindesc the gear plugin that allow to improve the splash screen system
 * @modulename
 * @required
 * @external
 * @author nio kasgami
 * 
 * @param playMe
 * @text play ME
 * @desc enable the playback for ME
 * @type boolean
 * @default true
 * @on yes
 * @off no
 * 
 * @param fadeSpeed
 * @text fade speed
 * @desc the speed the sprite take to fade in/out
 * @type number
 * @default 24
 * @param logos
 * @desc the list of logos to display
 * @type struct<logo>[]
 * @default []
 * @help
*/

/*~struct~logo:
 *  
 * @param filename
 * @desc the splashscreen filename
 * @type file
 * @dir img/system/
 * @default 
 * 
 * @param duration
 * @desc the number of frames that the logo stay on
 * @type number
 * @default 120
 * 
 * @param me
 * @desc the me file to play when the logo appear left it empty for 
 * @type file
 * @dir audio/me
 * @default 
 */