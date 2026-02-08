/*:
  * @target MZ
  * @plugindesc the gear plugin that rework the whole Menu System
  * @author Nio Kasgami
  * @base gear-inn-actions
  * @help
  *
  * ==========================================================================
  *  + Changelog
  * --------------------------------------------------------------------------
  *  + initial release
  *  + many Inc0der-shrooms died for this plugin
  *
  * @param inns
  * @type struct<Inn>[]
  */


/*~struct~Inn:
  *
  * @param displayName
  * @type text
  * @param id
  * @type text
  *
  * @param rooms
  * @type struct<Room>[]
  */



/*~struct~Room:
  *
  * @param name
  * @type text
  *
  * @param description
  * @type multiline_string
  *
  * @param price
  * @type number
  *
  * @param func
  * @text action
  * @type text
  * @param args
  * @type text[]
  *  
  */

/*~struct~RoomEffect:
  *
  * @param text
  * @type multiline_string
  *
  * @param icon
  * @desc used if a state, item , etc icon is needed
  * @type number
  *
  * @param type
  * @type select
  * @option TEXT ONLY
  * @value 0
  * @option ICON
  */

/// COMMON STRUCT =======================================

/*~struct~TextContainer:
  * @param x
  * @type number
  * @param y
  * @type number
  * @param maxWidth
  * @type number
  * @param lineHeight
  * @type number
  *
  * @param align
  * @type select
  * @option LEFT
  * @value left
  * @option CENTER
  * @value center
  * @option RIGHT
  * @value right
  *
  */
/*~struct~TilingStruct:
  * @param bitmap
  * @type file
  * @dir img/menu/status
  * @param coords
  * @type struct<Points>
  * 
  * @param scroll
  * @type struct<Points>
  * 
  * @param type
  * @desc describe if the picture is an single image or a tiling image
  * @type select
  * @option SINGLE
  * @value 0
  * @option ANIMATED
  * @value 1
  * @option TILING
  * @value 2
  */

/*~struct~Actor:
  * @param x
  * @type number
  * @param y
  * @type number
  * @param pivot
  * @type struct<Points>
*/

/*~struct~Points:
  * @param x
  * @desc the x coordinates
  * @type number
  * @param y
  * @desc the y coordinates
  * @type number
  */
///========================================================
(function () {
'use strict';



})();
