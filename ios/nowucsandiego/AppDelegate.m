/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "CodePush.h"
#include <asl.h>
#import "RCTLog.h"
#import "RCTUtils.h"
#import "RCTRootView.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

	NSURL *jsCodeLocation;
	
	BOOL isSimulator = NO;
	#if TARGET_IPHONE_SIMULATOR
		isSimulator = YES;
		
#ifdef DEBUG
    jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=false"];
#else
    jsCodeLocation = [CodePush bundleURL];
#endif
	#else
		jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
	#endif
	
	RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
																											moduleName:@"nowucsandiego"
																							 initialProperties:@{@"isSimulator":@(isSimulator)}
																									 launchOptions:launchOptions];
	
	// Get launch image
	NSString *launchImageName = nil;
	if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone) {
		CGFloat height = MAX(RCTScreenSize().width, RCTScreenSize().height);
		if (height == 480) launchImageName = @"LaunchImage-700@2x.png"; // iPhone 4/4s
		else if (height == 568) launchImageName = @"LaunchImage-700-568h@2x.png"; // iPhone 5/5s
		else if (height == 667) launchImageName = @"LaunchImage-800-667h@2x.png"; // iPhone 6
		else if (height == 736) launchImageName = @"LaunchImage-800-Portrait-736h@3x.png"; // iPhone 6+
	}
	
	// Create loading view
	UIImage *image = [UIImage imageNamed:launchImageName];
	if (image) {
		UIImageView *imageView = [[UIImageView alloc] initWithFrame:(CGRect){CGPointZero, RCTScreenSize()}];
		imageView.contentMode = UIViewContentModeBottom;
		imageView.image = image;
		rootView.loadingView = imageView;
	}
	
	self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
	UIViewController *rootViewController = [UIViewController new];
	rootViewController.view = rootView;
	self.window.rootViewController = rootViewController;
	[self.window makeKeyAndVisible];
	
	return YES;
}

@end
