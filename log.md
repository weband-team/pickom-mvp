2025-11-24 21:04:55.956  1747-1893  DisplayManager          pickom.io                            I  Choreographer implicitly registered for the refresh rate.
2025-11-24 21:04:57.112  1747-1747  ResourcesManager        pickom.io                            V  The following library key has been added: ResourcesKey{ mHash=30468fd7 mResDir=null mSplitDirs=[] mOverlayDirs=[] mLibDirs=[/data/app/~~Zgr8YXk96zoql1InFYcHgw==/com.google.android.webview-zkna1w0HlsIPK5PzWJLT9A==/WebViewGoogle.apk,/data/app/~~_I6jfgTmCjDqQ7op-YoS4w==/com.google.android.trichromelibrary_699813538-LrqKDZkPiCQMMa3pdh3bDA==/TrichromeLibrary.apk,/system_ext/framework/androidx.window.extensions.jar] mDisplayId=0 mOverrideConfig=v36 mCompatInfo={420dpi always-compat} mLoaders=[]}
2025-11-24 21:05:03.489  1747-1747  InsetsController        pickom.io                            D  hide(ime())
2025-11-24 21:05:07.733   734-2106  ActivityManager         system_server                        E  ANR in com.android.systemui
                                                                                                    PID: 1028
                                                                                                    Reason: executing service com.android.systemui/.keyguard.KeyguardService, waited 22311ms
                                                                                                    ErrorId: 6a145645-902d-4ce8-a8cd-80a30726e0eb
                                                                                                    Frozen: false
                                                                                                    Load: 23.21 / 5.74 / 1.92
                                                                                                    ----- Output from /proc/pressure/memory -----
                                                                                                    some avg10=8.34 avg60=1.93 avg300=0.43 total=1638067
                                                                                                    full avg10=2.77 avg60=0.66 avg300=0.14 total=639558
                                                                                                    ----- End output from /proc/pressure/memory -----
                                                                                                    ----- Output from /proc/pressure/cpu -----
                                                                                                    some avg10=90.46 avg60=48.72 avg300=13.56 total=42858800
                                                                                                    full avg10=0.00 avg60=0.00 avg300=0.00 total=0
                                                                                                    ----- End output from /proc/pressure/cpu -----
                                                                                                    ----- Output from /proc/pressure/io -----
                                                                                                    some avg10=19.03 avg60=10.90 avg300=3.16 total=10636364
                                                                                                    full avg10=0.11 avg60=1.09 avg300=0.43 total=1668171
                                                                                                    ----- End output from /proc/pressure/io -----
                                                                                                    
                                                                                                    CPU usage from 26ms to 5923ms later (2025-11-24 18:05:01.678 to 2025-11-24 18:05:07.576):
                                                                                                      40% 1420/com.google.android.inputmethod.latin: 26% user + 14% kernel / faults: 13725 minor 216 major
                                                                                                      32% 734/system_server: 16% user + 16% kernel / faults: 4683 minor 346 major
                                                                                                      21% 1747/pickom.io: 13% user + 8.2% kernel / faults: 3691 minor 152 major
                                                                                                      11% 49/kswapd0: 0% user + 11% kernel
                                                                                                      9% 1550/com.google.android.as: 4.2% user + 4.8% kernel / faults: 2717 minor 307 major
                                                                                                      7.4% 1028/com.android.systemui: 4.8% user + 2.6% kernel / faults: 3829 minor 446 major
                                                                                                      7.3% 1528/com.google.android.googlequicksearchbox:interactor: 3.6% user + 3.6% kernel / faults: 1922 minor 164 major
                                                                                                      6.9% 1353/com.google.android.gms.persistent: 4% user + 2.8% kernel / faults: 2122 minor 64 major
                                                                                                      6.9% 1541/com.google.android.gms: 4.4% user + 2.4% kernel / faults: 1617 minor 774 major
                                                                                                      5.3% 1189/com.google.android.apps.nexuslauncher: 2.3% user + 3% kernel / faults: 1855 minor 220 major
                                                                                                    100% TOTAL: 46% user + 52% kernel + 1.5% softirq
                                                                                                    CPU usage from 1042ms to 4097ms later (2025-11-24 18:05:02.695 to 2025-11-24 18:05:05.749):
                                                                                                      46% 1420/com.google.android.inputmethod.latin: 29% user + 17% kernel / faults: 5863 minor 156 major
                                                                                                        11% 1420/putmethod.latin: 6% user + 5.1% kernel
                                                                                                        8.4% 1936/Light-P0-2: 6.5% user + 1.8% kernel
                                                                                                        4.2% 1424/Jit thread pool: 2.3% user + 1.8% kernel
                                                                                                        3.7% 1425/HeapTaskDaemon: 2.8% user + 0.9% kernel
                                                                                                        3.2% 1953/Back-P10-1: 2.3% user + 0.9% kernel
                                                                                                        2.8% 2133/sp-control-1: 1.4% user + 1.4% kernel
                                                                                                        2.8% 2134/ExeSeq-P10-1: 1.8% user + 0.9% kernel
                                                                                                        1.4% 2138/Block-P11-2: 1.4% user + 0% kernel
                                                                                                        0.9% 2129/mdd-control-1: 0.4% user + 0.4% kernel
                                                                                                        0.4% 1584/queued-work-loo: 0.4% user + 0% kernel
                                                                                                        0.4% 1927/Light-P0-1: 0.4% user + 0% kernel
                                                                                                        0.4% 1956/Back-P10-2: 0% user + 0.4% kernel
                                                                                                        0.4% 1990/Back-P10-3: 0.4% user + 0% kernel
                                                                                                        0.4% 2124/Back-P10-4: 0.4% user + 0% kernel
                                                                                                        0.4% 2130/Primes-1: 0% user + 0.4% kernel
                                                                                                       +0% 2237/Block-P11-18: 0% user + 0% kernel
                                                                                                       +0% 2238/Block-P11-19: 0% user + 0% kernel
                                                                                                       +0% 2241/Block-P11-21: 0% user + 0% kernel
                                                                                                       +0% 2242/Block-P11-17: 0% user + 0% kernel
                                                                                                       +0% 2243/Block-P11-16: 0% user + 0% kernel
                                                                                                       +0% 2244/Block-P11-22: 0% user + 0% kernel
                                                                                                       +0% 2246/Block-P11-20: 0% user + 0% kernel
                                                                                                       +0% 2247/TracingMuxer: 0% user + 0% kernel
                                                                                                       +0% 2251/fonts-androidx: 0% user + 0% kernel
                                                                                                       +0% 2254/Primes-2: 0% user + 0% kernel
                                                                                                       +0% 2258/ProcessStablePh: 0% user + 0% kernel
                                                                                                       +0% 2280/arch_disk_io_0: 0% user + 0% kernel
                                                                                                       +0% 2281/arch_disk_io_1: 0% user + 0% kernel
                                                                                                      30% 734/system_server: 14% user + 16% kernel / faults: 1222 minor 106 major
                                                                                                        4.7% 2109/AnrAuxiliaryTas: 2.3% user + 2.3% kernel
                                                                                                        2.9% 871/NetworkWatchlis: 1.7% user + 1.1% kernel
                                                                                                        2.3% 756/HeapTaskDaemon: 1.7% user + 0.5% kernel
                                                                                                        1.7% 831/binder:734_5: 1.1% user + 0.5% kernel
                                                                                                        1.1% 734/system_server: 0.5% user + 0.5% kernel
                                                                                                        1.1% 830/binder:734_4: 0% user + 1.1% kernel
                                                                                                        1.1% 848/eduling.default: 0.5% user + 0.5% kernel
                                                                                                        1.1% 934/audioserver_lif: 1.1% user + 0% kernel
                                                                                                        1.1% 1228/binder:734_C: 0.5% user + 0.5% kernel
                                                                                                        1.1% 1581/binder:734_10: 0% user + 1.1% kernel
2025-11-24 21:05:07.763   734-2106  ActivityManager         system_server                        E      1.1% 1721/binder:734_14: 0% user + 1.1% kernel
                                                                                                        1.1% 1807/binder:734_1A: 0.5% user + 0.5% kernel
                                                                                                        1.1% 1829/binder:734_1C: 0.5% user + 0.5% kernel
                                                                                                        0.5% 754/socket_writer_q: 0% user + 0.5% kernel
                                                                                                        0.5% 771/android.ui: 0% user + 0.5% kernel
                                                                                                        0.5% 782/ActivityManager: 0% user + 0.5% kernel
                                                                                                        0.5% 806/PowerManagerSer: 0% user + 0.5% kernel
                                                                                                        0.5% 892/binder:734_6: 0% user + 0.5% kernel
                                                                                                        0.5% 914/WifiHandlerThre: 0% user + 0.5% kernel
                                                                                                        0.5% 1601/backup-0: 0% user + 0.5% kernel
                                                                                                        0.5% 1615/binder:734_11: 0.5% user + 0% kernel
                                                                                                        0.5% 1632/binder:734_12: 0.5% user + 0% kernel
                                                                                                        0.5% 1728/binder:734_16: 0% user + 0.5% kernel
                                                                                                        0.5% 1743/binder:734_17: 0.5% user + 0% kernel
                                                                                                        0.5% 1744/binder:734_18: 0% user + 0.5% kernel
                                                                                                        0.5% 1821/binder:734_1B: 0.5% user + 0% kernel
                                                                                                        0.5% 1830/binder:734_1D: 0% user + 0.5% kernel
                                                                                                        0.5% 1831/binder:734_1E: 0.5% user + 0% kernel
                                                                                                       +0% 2216/pool-69-thread-: 0% user + 0% kernel
                                                                                                       +0% 2256/pool-68-thread-: 0% user + 0% kernel
                                                                                                      13% 49/kswapd0: 0% user + 13% kernel
                                                                                                      10% 1528/com.google.android.googlequicksearchbox:interactor: 4.8% user + 5.7% kernel / faults: 885 minor 103 major
                                                                                                        2.8% 1735/Lite Thread #0: 1.4% user + 1.4% kernel
                                                                                                        1.4% 1958/Lite Thread #1: 0.9% user + 0.4% kernel
                                                                                                        0.9% 1691/BG Thread #0: 0% user + 0.9% kernel
                                                                                                        0.9% 1693/BG Thread #1: 0.4% user + 0.4% kernel
                                                                                                        0.9% 1959/BG Thread #2: 0.9% user + 0% kernel
                                                                                                        0.9% 1960/BG Thread #3: 0.4% user + 0.4% kernel
                                                                                                        0.4% 1533/Jit thread pool: 0.4% user + 0% kernel
                                                                                                      10% 1028/com.android.systemui: 7.7% user + 3% kernel / faults: 2440 minor 172 major
                                                                                                        5.1% 1035/HeapTaskDaemon: 3% user + 2% kernel
                                                                                                        3% 1151/SysUiBg: 3% user + 0% kernel
                                                                                                        1.5% 1028/ndroid.systemui: 1% user + 0.5% kernel
                                                                                                        0.5% 1034/Jit thread pool: 0.5% user + 0% kernel
                                                                                                       +0% 2268/SharedPreferenc: 0% user + 0% kernel
                                                                                                      8.7% 1550/com.google.android.as: 4.3% user + 4.3% kernel / faults: 804 minor 118 major
                                                                                                        2.9% 2016/aiai-normal-sha: 1.4% user + 1.4% kernel
                                                                                                        0.9% 1550/ogle.android.as: 0.4% user + 0.4% kernel
                                                                                                        0.4% 1554/HeapTaskDaemon: 0.4% user + 0% kernel
                                                                                                        0.4% 1710/aiai-app-predic: 0.4% user + 0% kernel
                                                                                                        0.4% 1726/arch_disk_io_0: 0.4% user + 0% kernel
                                                                                                        0.4% 1762/aiai-min-shared: 0% user + 0.4% kernel
                                                                                                        0.4% 2018/superpacks-cont: 0% user + 0.4% kernel
                                                                                                        0.4% 2116/aiai-nls-0: 0% user + 0.4% kernel
                                                                                                        0.4% 2144/aiai-brella-0: 0.4% user + 0% kernel
                                                                                                        0.4% 2160/WM.task-2: 0.4% user + 0% kernel
                                                                                                       +0% 2271/grpc-timer-0: 0% user + 0% kernel
                                                                                                       +0% 2294/aiai-captions-l: 0% user + 0% kernel
                                                                                                      8.8% 1747/pickom.io: 3.9% user + 4.9% kernel / faults: 134 minor 69 major
                                                                                                        7.8% 1753/Jit thread pool: 3.4% user + 4.4% kernel
                                                                                                        0.4% 1983/Chrome_IOThread: 0% user + 0.4% kernel
                                                                                                      8.2% 1541/com.google.android.gms: 5.3% user + 2.8% kernel / faults: 802 minor 620 major
                                                                                                        3.3% 2070/highpool[3]: 2.4% user + 0.9% kernel
                                                                                                        2.4% 1546/HeapTaskDaemon: 1.9% user + 0.4% kernel
                                                                                                        2.4% 1761/peration loader: 0.9% user + 1.4% kernel
                                                                                                        0.4% 1682/GoogleApiHandle: 0.4% user + 0% kernel
                                                                                                       +0% 2303/binder:1541_7: 0% user + 0% kernel
                                                                                                      7.5% 1353/com.google.android.gms.persistent: 3.7% user + 3.7% kernel / faults: 905 minor 34 major
                                                                                                        2.3% 1357/HeapTaskDaemon: 1.8% user + 0.4% kernel
                                                                                                        0.4% 1353/.gms.persistent: 0% user + 0.4% kernel
                                                                                                        0.4% 1361/binder:1353_1: 0% user + 0.4% kernel
                                                                                                        0.4% 1564/highpool[1]: 0% user + 0.4% kernel
                                                                                                        0.4% 1787/binder:1353_7: 0.4% user + 0% kernel
                                                                                                        0.4% 2127/-Executor] idle: 0.4% user + 0% kernel
                                                                                                       +0% 2269/netscheduler-qu: 0% user + 0% kernel
                                                                                                       +0% 2278/binder:1353_8: 0% user + 0% kernel
                                                                                                       +0% 2279/binder:1353_9: 0% user + 0% kernel
                                                                                                       +0% 2282/binder:1353_A: 0% user + 0% kernel
                                                                                                       +0% 2283/binder:1353_B: 0% user + 0% kernel
                                                                                                       +0% 2315/binder:1353_C: 0% user + 0% kernel
                                                                                                       +0% 2316/binder:1353_D: 0% user + 0% kernel
                                                                                                      6.4% 1882/com.android.chrome: 2.4% user + 3.9% kernel / faults: 5380 minor 44 major
                                                                                                        4.9% 1882/.android.chrome: 1.4% user + 3.4% kernel
2025-11-24 21:05:49.291  3307-3341  DisplayManager          pickom.io                            I  Choreographer implicitly registered for the refresh rate.
2025-11-24 21:05:50.330  3307-3307  ResourcesManager        pickom.io                            V  The following library key has been added: ResourcesKey{ mHash=30468fd7 mResDir=null mSplitDirs=[] mOverlayDirs=[] mLibDirs=[/data/app/~~Zgr8YXk96zoql1InFYcHgw==/com.google.android.webview-zkna1w0HlsIPK5PzWJLT9A==/WebViewGoogle.apk,/data/app/~~_I6jfgTmCjDqQ7op-YoS4w==/com.google.android.trichromelibrary_699813538-LrqKDZkPiCQMMa3pdh3bDA==/TrichromeLibrary.apk,/system_ext/framework/androidx.window.extensions.jar] mDisplayId=0 mOverrideConfig=v36 mCompatInfo={420dpi always-compat} mLoaders=[]}
2025-11-24 21:06:21.582  3307-3307  Capacitor/AppPlugin     pickom.io                            D  Firing change: true
2025-11-24 21:06:21.587  3307-3307  Capacitor/AppPlugin     pickom.io                            V  Notifying listeners for event appStateChange
2025-11-24 21:06:21.587  3307-3307  Capacitor/AppPlugin     pickom.io                            D  No listeners found for event appStateChange
2025-11-24 21:06:21.587  3307-3307  Capacitor/AppPlugin     pickom.io                            V  Notifying listeners for event resume
2025-11-24 21:06:21.587  3307-3307  Capacitor/AppPlugin     pickom.io                            D  No listeners found for event resume
2025-11-24 21:06:21.601  3307-3307  Capacitor/NetworkPlugin pickom.io                            D  Detected pre-pause and after-pause network status mismatch. Updating network status and notifying listeners.
2025-11-24 21:06:21.609  3307-3307  Capacitor/NetworkPlugin pickom.io                            V  Notifying listeners for event networkStatusChange
2025-11-24 21:06:21.609  3307-3307  Capacitor/NetworkPlugin pickom.io                            D  No listeners found for event networkStatusChange
2025-11-24 21:06:21.616  3307-3307  Capacitor               pickom.io                            D  App resumed
2025-11-24 21:06:21.802  3307-3441  Capacitor/NetworkPlugin pickom.io                            V  Notifying listeners for event networkStatusChange
2025-11-24 21:06:21.802  3307-3441  Capacitor/NetworkPlugin pickom.io                            D  No listeners found for event networkStatusChange
2025-11-24 21:06:21.810  3307-3307  VRI[MainActivity]       pickom.io                            D  WindowInsets changed: navigationBars:[0,0,0,63] mandatorySystemGestures:[0,0,0,84] 
2025-11-24 21:06:22.276  3307-3321  HWUI                    pickom.io                            I  Davey! duration=774ms; Flags=1, FrameTimelineVsyncId=16471, IntendedVsync=144134370098, Vsync=144267703426, InputEventId=0, HandleInputStart=144271146800, AnimationStart=144271190200, PerformTraversalsStart=144271223500, DrawStart=144630464900, FrameDeadline=144151036764, FrameStartTime=144270504700, FrameInterval=16666666, WorkloadTarget=16666666, SyncQueued=144766711300, SyncStart=144768002800, IssueDrawCommandsStart=144768094200, SwapBuffers=144905596200, FrameCompleted=144910090100, DequeueBufferDuration=26500, QueueBufferDuration=3455100, GpuCompleted=144909938900, SwapBuffersCompleted=144910090100, DisplayPresentTime=0, CommandSubmissionCompleted=144905596200, 
2025-11-24 21:06:22.313  3307-3307  Choreographer           pickom.io                            I  Skipped 40 frames!  The application may be doing too much work on its main thread.
2025-11-24 21:06:22.376  3307-3321  HWUI                    pickom.io                            I  Davey! duration=714ms; Flags=0, FrameTimelineVsyncId=16501, IntendedVsync=144284370092, Vsync=144951036732, InputEventId=0, HandleInputStart=144961280100, AnimationStart=144961325100, PerformTraversalsStart=144974193200, DrawStart=144974750700, FrameDeadline=144934370066, FrameStartTime=144960806100, FrameInterval=16666666, WorkloadTarget=16666666, SyncQueued=144975369100, SyncStart=144979047000, IssueDrawCommandsStart=144979116200, SwapBuffers=144991049800, FrameCompleted=145002484700, DequeueBufferDuration=24200, QueueBufferDuration=863300, GpuCompleted=145002239800, SwapBuffersCompleted=145002484700, DisplayPresentTime=0, CommandSubmissionCompleted=144991049800, 
2025-11-24 21:06:22.842  3307-3307  InsetsController        pickom.io                            D  hide(ime())
2025-11-24 21:06:22.848  3307-3307  ImeTracker              pickom.io                            I  pickom.io:972835b8: onCancelled at PHASE_CLIENT_ALREADY_HIDDEN
2025-11-24 21:06:32.678  3307-3593  HWUI                    pickom.io                            I  Davey! duration=771ms; Flags=0, FrameTimelineVsyncId=17524, IntendedVsync=154534369682, Vsync=154551036348, InputEventId=0, HandleInputStart=154551115100, AnimationStart=154568767600, PerformTraversalsStart=154581886200, DrawStart=154582070300, FrameDeadline=154551036348, FrameStartTime=154551096200, FrameInterval=16666666, WorkloadTarget=16666666, SyncQueued=154595567700, SyncStart=154597595500, IssueDrawCommandsStart=154613813400, SwapBuffers=155296080600, FrameCompleted=155308379900, DequeueBufferDuration=31300, QueueBufferDuration=7886600, GpuCompleted=155308193100, SwapBuffersCompleted=155308379900, DisplayPresentTime=0, CommandSubmissionCompleted=155296080600, 
2025-11-24 21:06:32.725  3307-3307  VRI[MainActivity]       pickom.io                            D  WindowInsets changed: statusBars:[0,63,0,0] mandatorySystemGestures:[0,63,0,84] 
2025-11-24 21:06:35.503  3307-3307  Capacitor/Console       pickom.io                            I  File: webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js - Line 25582 - Msg: %cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold
2025-11-24 21:06:38.785  3307-3307  ImeTracker              pickom.io                            I  pickom.io:ca6d8908: onRequestShow at ORIGIN_CLIENT reason SHOW_SOFT_INPUT fromUser false
2025-11-24 21:06:38.789  3307-3307  InsetsController        pickom.io                            D  show(ime())
2025-11-24 21:06:38.792  3307-3307  InsetsController        pickom.io                            D  Setting requestedVisibleTypes to 511 (was 503)
2025-11-24 21:06:41.294  3307-3307  WindowOnBackDispatcher  pickom.io                            D  setTopOnBackInvokedCallback (unwrapped): android.view.ImeBackAnimationController@7d7a76c
2025-11-24 21:06:42.520  3307-3307  Capacitor/Plugin        pickom.io                            V  To native (Capacitor plugin): callbackId: 73815912, pluginId: StatusBar, methodName: setStyle
2025-11-24 21:06:42.554  3307-3307  Capacitor               pickom.io                            V  callback: 73815912, pluginId: StatusBar, methodName: setStyle, methodData: {"style":"LIGHT"}
2025-11-24 21:06:42.668  3307-3307  Capacitor/...oardPlugin pickom.io                            V  Notifying listeners for event keyboardWillShow
2025-11-24 21:06:42.668  3307-3307  Capacitor/...oardPlugin pickom.io                            D  No listeners found for event keyboardWillShow
2025-11-24 21:06:42.684  3307-3307  InteractionJankMonitor  pickom.io                            W  Initializing without READ_DEVICE_CONFIG permission. enabled=false, interval=1, missedFrameThreshold=3, frameTimeThreshold=64, package=pickom.io
2025-11-24 21:06:42.931  3307-3307  ImeTracker              pickom.io                            I  pickom.io:ca6d8908: onShown
2025-11-24 21:06:42.931  3307-3307  Capacitor/...oardPlugin pickom.io                            V  Notifying listeners for event keyboardDidShow
2025-11-24 21:06:42.931  3307-3307  Capacitor/...oardPlugin pickom.io                            D  No listeners found for event keyboardDidShow
2025-11-24 21:06:43.515  3307-3307  Capacitor/Console       pickom.io                            I  File:  - Line 333 - Msg: undefined
2025-11-24 21:06:43.535  3307-3307  Capacitor/Plugin        pickom.io                            V  To native (Capacitor plugin): callbackId: 73815913, pluginId: StatusBar, methodName: setBackgroundColor
2025-11-24 21:06:43.542  3307-3307  Capacitor               pickom.io                            V  callback: 73815913, pluginId: StatusBar, methodName: setBackgroundColor, methodData: {"color":"#FF9500"}
2025-11-24 21:06:43.780  3307-3307  Capacitor/Console       pickom.io                            I  File:  - Line 333 - Msg: undefined
2025-11-24 21:06:43.835  3307-3307  Capacitor/Plugin        pickom.io                            V  To native (Capacitor plugin): callbackId: 73815914, pluginId: Keyboard, methodName: setAccessoryBarVisible
2025-11-24 21:06:43.836  3307-3307  Capacitor               pickom.io                            V  callback: 73815914, pluginId: Keyboard, methodName: setAccessoryBarVisible, methodData: {"isVisible":true}
2025-11-24 21:06:43.852  3307-3409  Capacitor               pickom.io                            D  Sending plugin error: {"save":false,"callbackId":"73815914","pluginId":"Keyboard","methodName":"setAccessoryBarVisible","success":false,"error":{"message":"not implemented","code":"UNIMPLEMENTED"}}
2025-11-24 21:06:43.976  3307-3307  Capacitor/Plugin        pickom.io                            V  To native (Capacitor plugin): callbackId: 73815915, pluginId: App, methodName: addListener
2025-11-24 21:06:43.985  3307-3307  Capacitor               pickom.io                            V  callback: 73815915, pluginId: App, methodName: addListener, methodData: {"eventName":"appStateChange"}
2025-11-24 21:06:44.006  3307-3307  Capacitor/Plugin        pickom.io                            V  To native (Capacitor plugin): callbackId: 73815916, pluginId: Network, methodName: addListener
2025-11-24 21:06:44.006  3307-3307  Capacitor               pickom.io                            V  callback: 73815916, pluginId: Network, methodName: addListener, methodData: {"eventName":"networkStatusChange"}
2025-11-24 21:06:44.007  3307-3307  Capacitor/Plugin        pickom.io                            V  To native (Capacitor plugin): callbackId: 73815917, pluginId: Network, methodName: getStatus
2025-11-24 21:06:44.007  3307-3307  Capacitor               pickom.io                            V  callback: 73815917, pluginId: Network, methodName: getStatus, methodData: {}
2025-11-24 21:06:52.714  3307-3307  ImeTracker              pickom.io                            I  pickom.io:8bdd4f0b: onRequestShow at ORIGIN_CLIENT reason SHOW_SOFT_INPUT fromUser false
2025-11-24 21:06:52.715  3307-3307  InsetsController        pickom.io                            D  show(ime())
2025-11-24 21:06:52.715  3307-3307  ImeTracker              pickom.io                            I  pickom.io:8bdd4f0b: onCancelled at PHASE_CLIENT_APPLY_ANIMATION
2025-11-24 21:06:58.329  3307-3307  Choreographer           pickom.io                            I  Skipped 50 frames!  The application may be doing too much work on its main thread.
2025-11-24 21:06:58.389  3307-3321  HWUI                    pickom.io                            I  Davey! duration=931ms; Flags=0, FrameTimelineVsyncId=23899, IntendedVsync=180017706532, Vsync=180017706532, InputEventId=0, HandleInputStart=180020292200, AnimationStart=180020312900, PerformTraversalsStart=180027818100, DrawStart=180027910900, FrameDeadline=180101035318, FrameStartTime=180020274800, FrameInterval=16666666, WorkloadTarget=16666666, SyncQueued=180028222200, SyncStart=180064572800, IssueDrawCommandsStart=180064645700, SwapBuffers=180960361100, FrameCompleted=180985463200, DequeueBufferDuration=28000, QueueBufferDuration=6425900, GpuCompleted=180985463200, SwapBuffersCompleted=180972558100, DisplayPresentTime=0, CommandSubmissionCompleted=180960361100, 
2025-11-24 21:06:58.842  3307-3321  HWUI                    pickom.io                            I  Davey! duration=1104ms; Flags=0, FrameTimelineVsyncId=23915, IntendedVsync=180134370164, Vsync=180967703414, InputEventId=0, HandleInputStart=180979338800, AnimationStart=180979364100, PerformTraversalsStart=181002198000, DrawStart=181002292400, FrameDeadline=181267701946, FrameStartTime=180977226800, FrameInterval=16666665, WorkloadTarget=16666666, SyncQueued=181002608600, SyncStart=181243813800, IssueDrawCommandsStart=181243863900, SwapBuffers=181451291300, FrameCompleted=181480358600, DequeueBufferDuration=27000, QueueBufferDuration=1749700, GpuCompleted=181480358600, SwapBuffersCompleted=181464400900, DisplayPresentTime=0, CommandSubmissionCompleted=181451291300, 
2025-11-24 21:07:07.883  3307-3441  Capacitor/NetworkPlugin pickom.io                            V  Notifying listeners for event networkStatusChange
2025-11-24 21:07:27.325  3307-3441  Capacitor/NetworkPlugin pickom.io                            V  Notifying listeners for event networkStatusChange
2025-11-24 21:07:27.386  3307-3441  Capacitor/NetworkPlugin pickom.io                            V  Notifying listeners for event networkStatusChange
2025-11-24 21:07:27.925  3307-3441  Capacitor/NetworkPlugin pickom.io                            V  Notifying listeners for event networkStatusChange
2025-11-24 21:07:33.911  3307-3441  Capacitor/NetworkPlugin pickom.io                            V  Notifying listeners for event networkStatusChange
2025-11-24 21:07:34.694  3307-3441  Capacitor/NetworkPlugin pickom.io                            V  Notifying listeners for event networkStatusChange
2025-11-24 21:07:38.539  3307-3307  Choreographer           pickom.io                            I  Skipped 33 frames!  The application may be doing too much work on its main thread.
