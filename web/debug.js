//author @mlnck
if(!window.console){window.console = {};}

  //global settings pseudo-constants
  console.GLOBAL_SETTINGS_UPDATED = {setLogLevel:false,showGroups:false,debugCalled:false};
  console.GLOBAL_SETTINGS_ERROR_MESSAGE = 'Global settings (`setLogLevel`,`showGroups`) may only be applied once and must be applied before any other Qonsole calls.';
  console.GLOBAL_SETTINGS_ERROR = false;
  console.BROWSER_URL_OVERRIDE = 0;
  console.BROWSER_URL_OVERRIDE_MESSAGE = 'This feature is not to be used for development debugging. '+
                                         'It is meant for those cases when the code is live and a bug is noticed. '+
                                         'By using this you will lose many of the customization and helping options '+
                                         'And will more than likely introduce unwanted behavior if using it during the normal debugging process.';
  //log level pseudo-constants
  console.DEBUG = 'CONSOLE_DEBUG_LOG_DEBUG'; console.NORM = 'CONSOLE_DEBUG_LOG_NORMAL'; console.PROD = 'CONSOLE_DEBUG_LOG_PRODUCTION';
  //type pseudo-constants
  console.INFO = 'CONSOLE_DEBUG_INFO'; console.ERR = 'CONSOLE_DEBUG_ERR'; console.WARN = 'CONSOLE_DEBUG_WARN';
  console.DO_PROFILE = false;
  //user defined pseudo-constants
  console.GROUPS = {};

  console.handleGlobalSettingsError = function()
  {
    console.GLOBAL_SETTINGS_ERROR = true;
    console.error(console.GLOBAL_SETTINGS_ERROR_MESSAGE);
    return false;
  }
  console.setLogLevel = function(s)
  {
    if(console.GLOBAL_SETTINGS_UPDATED.setLogLevel){ console.handleGlobalSettingsError(); return false; }
    console.GLOBAL_SETTINGS_UPDATED.setLogLevel = true;
    this.logLevel = (s === console.NORM) ? console.NORM : (s === console.PROD) ? console.PROD : console.DEBUG;
  }
  console.showGroups = function(a)
  {
    if(console.GLOBAL_SETTINGS_UPDATED.showGroups){ console.handleGlobalSettingsError(); return false; }
    //ADD TO README
    //Groups can only be toggled in the settings - all toggled off, then individually turned back on
      //if showGroups is used, default mode is automatically set to PROD
    console.GLOBAL_SETTINGS_UPDATED.showGroups = true;
    this.logLevel = console.PROD;
    a.map((itm,indx)=>{ console.GROUPS[itm]=itm; });
  }
  console.isLevel = function(s){
    this.OVERRIDE_GLOBAL = (s === console.NORM) ? console.NORM : (s === console.PROD) ? console.PROD : console.DEBUG;
    return this;
  }
  console.setGroup = function(s,ss=''){
    if(console.GROUPS.hasOwnProperty(s)){ this.OVERRIDE_GLOBAL = (ss === console.NORM) ? console.NORM : console.DEBUG }
    return this;
  }
  console.browserOverride = function(){
    console.warn('!!! BROWSER OVERRIDE WARNING ↴');
    console.info(console.BROWSER_URL_OVERRIDE_MESSAGE);
    console.warn('!!! BROWSER OVERRIDE WARNING ↑');
    console.BROWSER_URL_OVERRIDE = (~window.location.href.indexOf('qonsole-normal')) ? 1 : 2;
  }
  console.debug = function(...args){
      //stop script if there is an error
    if(console.GLOBAL_SETTINGS_ERROR){ return false; }
      //ensures global settings are set before anything else
    console.GLOBAL_SETTINGS_UPDATED.showGroups = true;
    console.GLOBAL_SETTINGS_UPDATED.setLogLevel = true;

    if(console.DO_PROFILE){ console.profile('debug profile'); }//Not fully supported + Increases Load Time Drastically
    console.time('debugged in');

    if(console.logLevel && console.logLevel != console.DEBUG){ args.splice(0,0,console.logLevel); }
    if(console.OVERRIDE_GLOBAL)
    { if(this.logLevel){ args.splice(0,1); } args.splice(0,0,console.OVERRIDE_GLOBAL); delete console.OVERRIDE_GLOBAL; }

    if(console.BROWSER_URL_OVERRIDE)
    { this.logLevel = (console.BROWSER_URL_OVERRIDE === 1) ? console.NORM : console.DEBUG; }

    let debugType, settingOffset=0;
    switch(args[0])
    {
      case 'CONSOLE_DEBUG_INFO': debugType = 'info'; break;
      case 'CONSOLE_DEBUG_ERR': debugType = 'error'; break;
      case 'CONSOLE_DEBUG_WARN': debugType = 'warn'; break;
      case 'CONSOLE_DEBUG_LOG_PRODUCTION': return false;
      case 'CONSOLE_DEBUG_LOG_NORMAL':
        debugType = checkTypeFromSettings(args[1]);
        if(debugType === 'err'){ debugType = 'error'; }
        (debugType === 'log') ? args.splice(0,1) : args.splice(0,2) ;
        console[debugType](args);
        return;
      case 'CONSOLE_DEBUG_LOG_DEBUG': args.splice(0,1); debugType = checkTypeFromSettings(args[0]); break;
      default : debugType = 'log';
    }
    console.count('--START DEBUG BLOCK--');
    console.timeStamp('started at');//Not fully supported
    for(let i=0; i<args.length; i++)
    {
      if(~String(args[i]).indexOf('CONSOLE_DEBUG_')){ settingOffset++; continue; }//catchall to remove debug settings from being logged
      let itemStr = (i+(1-settingOffset))+') ';
      if(typeof(args[i]) === 'string' && args[i].charAt(args[i].length-1) === ':')
      { console[debugType](itemStr,args[i],args[++i]); }
      else
      { console[debugType](itemStr,args[i]); }
      checkForObject(itemStr,args[i]);
    }
    console.groupCollapsed('Stack Trace:'); console.trace(); console.groupEnd();
    console.timeEnd('debugged in');
    console.log('--END DEBUG BLOCK--');console.log('');console.log('');
    if(console.DO_PROFILE){ console.profileEnd('debug profile'); }//Not fully supported + Increases Load Time Drastically
    function checkForObject(s,o)
    {
      if(typeof(o) === 'object'){ console[debugType]('Tabular data for item '+s.replace(')','')+'↴'); }
      formatOutput(o);
    }
    function formatOutput(o,title='')
    {
      if(typeof(o) !== 'object'){ return false; }
      let nest = [],
          grpTitle = (+title) ? 'view table from item '+title+' above' : 'view root table'
      nest.push(o);
      console.groupCollapsed(grpTitle); console.table(nest); console.groupEnd();
      if(Array.isArray(o))
      {
        o.forEach(function(itm,indx){
          if(typeof(o) === 'object'){ formatOutput(itm,indx); }
        });
      }
      if(~String(o.constructor).indexOf('Object'))
      {
        let indx = 0;
        for(let k in o){ if(typeof(o[k]) === 'object'){ formatOutput(o[k],indx); } indx++; }
      }
    }
    function checkTypeFromSettings(s)
    {
      return (~String(s).indexOf('CONSOLE_DEBUG_')) ? s.replace('CONSOLE_DEBUG_','').toLowerCase() : 'log' ;
    }
  };
if(~window.location.href.indexOf('qonsole-debug')){ console.browserOverride(); }
