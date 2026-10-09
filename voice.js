(function(root){'use strict';
const normalize=t=>t.toLowerCase().replace(/[Ӏӏ]/g,'ӏ').replace(/([а-яё])[1!](?=[а-яё])/g,'$1ӏ').replace(/[!.,…?:;—–\-]/g,' ').replace(/\s+/g,' ').trim();
async function availability(mode){const R=root.SpeechRecognition||root.webkitSpeechRecognition;if(!root.isSecureContext)return{ok:false,reason:'Для микрофона нужен HTTPS или localhost.'};if(!R||typeof R.available!=='function')return{ok:false,reason:'Браузер не умеет проверять локальное распознавание этого языка.'};try{const status=await R.available({langs:[mode],processLocally:true});return{ok:status==='available',status,reason:status==='available'?'Языковой пакет доступен.':'Локальное распознавание '+mode+' недоступно ('+status+').'}}catch{return{ok:false,reason:'Браузер не подтвердил поддержку этого языка.'}}}
root.LumiVoice={normalize,availability};
})(typeof window!=='undefined'?window:this);
