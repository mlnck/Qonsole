//author @mlnck
if(!window.console){window.console = {};}
  //TODO: Group Level Creation/Settings
  //TODO: Settings key in console objects - check for unique (global settings can only be called once)
  //TODO: Settings key in console objects - check for at start (global settings can only be called before any other console.debug)
  //TODO: (optional)- Allow overrides to be set via url GET vars (useful for testing when client could see) [e.g. www.site.com?qonsole-debug-type=info&qonsole-debug-log=normal (etc) ]

  //log level pseudo-constants
  console.DEBUG = 'CONSOLE_DEBUG_LOG_DEBUG'; console.NORM = 'CONSOLE_DEBUG_LOG_NORMAL'; console.PROD = 'CONSOLE_DEBUG_LOG_PRODUCTION';
  //type pseudo-constants
  console.INFO = 'CONSOLE_DEBUG_INFO'; console.ERR = 'CONSOLE_DEBUG_ERR'; console.WARN = 'CONSOLE_DEBUG_WARN';
  console.DO_PROFILE = false;

  console.setLogLevel = function(s)
  { this.logLevel = (s === console.NORM) ? console.NORM : (s === console.PROD) ? console.PROD : console.DEBUG; }
  console.isLevel = function(s){
    this.OVERRIDE_GLOBAL = (s === console.NORM) ? console.NORM : (s === console.PROD) ? console.PROD : console.DEBUG;
    return this;
  }
  console.debug = function(...args){
    if(console.DO_PROFILE){ console.profile('debug profile'); }//Not fully supported + Increases Load Time Drastically
    console.time('debugged in');

    if(console.logLevel && console.logLevel != console.DEBUG){ args.splice(0,0,console.logLevel); }
    if(console.OVERRIDE_GLOBAL)
    { if(this.logLevel){ args.splice(0,1); } args.splice(0,0,console.OVERRIDE_GLOBAL); delete console.OVERRIDE_GLOBAL; }

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
