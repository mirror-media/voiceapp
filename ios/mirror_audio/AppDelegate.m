/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
#import "AppDelegate.h"
#import <AVFoundation/AVFoundation.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

UIBackgroundTaskIdentifier _bgTaskId;

@import Firebase;

@implementation AppDelegate

-(void)applicationWillResignActive:(UIApplication *)application
{
  // 開啟後台處理多媒體事件
  [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];
  AVAudioSession *session=[AVAudioSession sharedInstance];
  [session setActive:YES error:nil];
  // 背景播放
  [session setCategory:AVAudioSessionCategoryPlayback error:nil];
  // 要重新在後台設定背景 id, 才能繼續背景播放；以下這段 code 對應 Appdelegate.m 的 UIBackgroundTaskIdentifier _bgTaskId
  _bgTaskId=[AppDelegate backgroundPlayerID:_bgTaskId];
}

+(UIBackgroundTaskIdentifier)backgroundPlayerID:(UIBackgroundTaskIdentifier)backTaskId
{
  // 設定 AVAudioSession sharedInstance
  AVAudioSession *session=[AVAudioSession sharedInstance];
  [session setCategory:AVAudioSessionCategoryPlayback error:nil];
  [session setActive:YES error:nil];
  // 允許應用程式接受遠端控制
  [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];
  // 設定背景 Task ID
  UIBackgroundTaskIdentifier newTaskId=UIBackgroundTaskInvalid;
  newTaskId=[[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:nil];
  if(newTaskId!=UIBackgroundTaskInvalid&&backTaskId!=UIBackgroundTaskInvalid)
  {
    [[UIApplication sharedApplication] endBackgroundTask:backTaskId];
  }
  return newTaskId;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }

  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryAmbient error:nil];
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"mirror_audio"
                                            initialProperties:nil];


   rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


@end
