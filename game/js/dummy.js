class pluginManager {

  isPluginExists(namespace){
    return true // no need to implement for example sake
  }

}

export class Bar{
  static foo(){

  }
}

// pluginA.js
const aliasA = Scene_Map.prototype.foo;
Scene_Map.prototype.foo = function(){
  Bar.foo();
  aliasA.call(this);
}




// pluginB.js
// in this case it would be impossible to do an alias for this function because I need to do specific things
// which require me to overwrite the function but still want to offer compatibility layers.

Scene_Map.prototype.bar = function(){
  if(PluginManager.isPluginExists("pluginA")){
    // assuming I cant use async here.
    let func = import("@plugin/pluginA.js");
    func.then(pluginA => {
      pluginA.Bar.foo();
    })
    // I do my stuff
  }
  // I do my stuff
}

// or in this case I need to edit the way a func will behave from pluginA

if(PluginManager.isPluginExists("pluginA")){
  let func = import("@plugin/pluginA.js").then(pluginA => {
    return pluginA.Bar;
  })
  const alias = func.foo;
  func.foo = function(){
    // do stuff
    alias.call(this);
  }
}
