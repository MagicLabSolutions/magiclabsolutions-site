"""Export real localized Compose views from the dedicated offline marketing AVD."""
import hashlib,json,pathlib,subprocess,sys,time
ROOT=pathlib.Path(__file__).resolve().parents[2]
BASE=ROOT/'docs/marketing/october-2026/localized'
ADB=pathlib.Path('/Users/fabio.hoffmann/Library/Android/sdk/platform-tools/adb')
SERIAL=sys.argv[1] if len(sys.argv)>1 else 'emulator-5580'
def adb(*args,**kwargs):return subprocess.run([str(ADB),'-s',SERIAL,*args],check=True,**kwargs)
name=adb('emu','avd','name',capture_output=True,text=True).stdout.splitlines()[0].strip()
if name!='magiclab_zuzu_marketing':raise SystemExit('Refusing to use a non-marketing emulator: '+name)
locales=json.loads((BASE/'languages.json').read_text())['zuzu']['locales']
apk=pathlib.Path('/private/tmp/magiclab-zuzu-android-capture/app/build/outputs/apk/debug/app-debug.apk')
source=pathlib.Path('/private/tmp/magiclab-zuzu-android-capture/app/src/androidTest/java/com/magiclabsolutions/zuzu/layout/LayoutAudit.kt')
for locale in locales:
 target=BASE/'native/zuzu'/locale/'android';target.mkdir(parents=True,exist_ok=True)
 if all((target/f'native-{i}.png').exists() for i in range(1,7)):continue
 result=adb('shell','am','instrument','-w','-e','class','com.magiclabsolutions.zuzu.layout.LayoutAudit#localizedMarketing','-e','marketingLocale',locale,'com.magiclabsolutions.zuzu.test/com.magiclabsolutions.zuzu.HiltTestRunner',capture_output=True,text=True,timeout=180)
 if 'OK (1 test)' not in result.stdout:raise RuntimeError(result.stdout[-3000:])
 for i in range(1,7):adb('pull',f'/sdcard/Android/data/com.magiclabsolutions.zuzu/files/marketing-localized/{locale}/native-{i}_phone_portrait_427x952dp.png',str(target/f'native-{i}.png'),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 record={'locale':locale,'capture_locale':locale,'platform':'android','method':'production Compose views with offline fictional fixtures','avd':name,'app_sha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'capture_source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'screens':[{'file':f'native-{i}.png','sha256':hashlib.sha256((target/f'native-{i}.png').read_bytes()).hexdigest()}for i in range(1,7)]}
 (target/'capture-zuzu-android.json').write_text(json.dumps(record,indent=2)+'\n')
 print('zuzu android',locale,'captured',flush=True)
