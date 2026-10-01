import subprocess,time
from pathlib import Path
root=Path('/private/tmp/magiclab-myrenewals-native'); app='/private/tmp/magiclab-myrenewals-build/Build/Products/Debug-iphonesimulator/SubscriptionManager.app';bundle='com.magiclabsolutions.subscriptionmanager'
for platform,sim in [('iphone','8BA967B0-0E64-4135-9E9E-5DF5335E9079'),('ipad','7E98BBE3-6DA5-439F-BCC3-63A9C9F2480C')]:
 folder=root/platform;folder.mkdir(parents=True,exist_ok=True)
 subprocess.run(['xcrun','simctl','install',sim,app],check=True)
 subprocess.run(['xcrun','simctl','ui',sim,'appearance','light'],check=True)
 subprocess.run(['xcrun','simctl','status_bar',sim,'override','--time','9:41','--batteryState','charged','--batteryLevel','100','--wifiMode','active','--wifiBars','3'],check=True)
 for i,screen in enumerate(['home','import','renewals','profiles','detail','plans'],1):
  subprocess.run(['xcrun','simctl','terminate',sim,bundle],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  subprocess.run(['xcrun','simctl','launch',sim,bundle,'-marketing-screen',screen,'-AppleLanguages','(en)','-AppleLocale','en_US'],check=True)
  time.sleep(4)
  subprocess.run(['xcrun','simctl','io',sim,'screenshot',str(folder/f'native-{i}.png')],check=True)
  print(platform,screen,flush=True)
 subprocess.run(['xcrun','simctl','terminate',sim,bundle],check=True)
