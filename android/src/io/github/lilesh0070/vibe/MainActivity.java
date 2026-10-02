package io.github.lilesh0070.vibe;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.*;
import android.widget.*;

/** HTTPS Vibe shell; no JavaScript bridge or local file access. */
public final class MainActivity extends Activity {
 private static final String HOME="https://lilesh0070.github.io/vibe/";
 private WebView web;
 private FrameLayout root;
 private ProgressBar progress;
 private LinearLayout error;
 private View video;
 private WebChromeClient.CustomViewCallback videoCallback;
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  root=new FrameLayout(this);
  root.setBackgroundColor(Color.rgb(17,18,20));
  setContentView(root);
  if(Build.VERSION.SDK_INT>=30) {
   getWindow().setDecorFitsSystemWindows(false);
   getWindow().getInsetsController().setSystemBarsAppearance(0,24);
   root.setOnApplyWindowInsetsListener((v,insets)->{
    android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.ime());
    v.setPadding(bars.left,bars.top,bars.right,bars.bottom);
    return insets;
   });
  }
  web=new WebView(this);
  web.setBackgroundColor(Color.rgb(17,18,20));
  root.addView(web,new FrameLayout.LayoutParams(-1,-1));
  WebSettings s=web.getSettings();
  s.setJavaScriptEnabled(true);
  s.setDomStorageEnabled(true);
  s.setAllowFileAccess(false);
  s.setAllowContentAccess(false);
  s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  s.setMediaPlaybackRequiresUserGesture(false);
  String version="2.1.0";
  try { version=getPackageManager().getPackageInfo(getPackageName(),0).versionName; } catch(Exception ignored) {}
  s.setUserAgentString(s.getUserAgentString()+" VibeAndroid/"+version);
  CookieManager.getInstance().setAcceptThirdPartyCookies(web,true);
  progress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
  root.addView(progress,new FrameLayout.LayoutParams(-1,8));
  error=new LinearLayout(this);
  error.setOrientation(LinearLayout.VERTICAL);
  error.setGravity(android.view.Gravity.CENTER);
  error.setPadding(32,32,32,32);
  error.setBackgroundColor(Color.rgb(17,18,20));
  TextView text=new TextView(this);
  text.setText("Vibe needs an internet connection.\nCheck your connection and try again.");
  text.setTextSize(18);
  text.setTextColor(Color.WHITE);
  text.setGravity(android.view.Gravity.CENTER);
  error.addView(text);
  Button retry=new Button(this);
  retry.setText("Try again");
  retry.setOnClickListener(v->{error.setVisibility(View.GONE);web.loadUrl(HOME);});
  error.addView(retry);
  error.setVisibility(View.GONE);
  root.addView(error,new FrameLayout.LayoutParams(-1,-1));
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
    if(!request.isForMainFrame())return false;
    Uri uri=request.getUrl();
    if(isVibe(uri))return false;
    openExternal(uri);
    return true;
   }
   @Override public void onPageFinished(WebView view,String url){progress.setVisibility(View.GONE);}
   @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError e){
    if(request.isForMainFrame()){error.setVisibility(View.VISIBLE);progress.setVisibility(View.GONE);}
   }
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onProgressChanged(WebView view,int value){
    progress.setProgress(value);progress.setVisibility(value<100?View.VISIBLE:View.GONE);
   }
   @Override public void onShowCustomView(View view,CustomViewCallback callback){
    if(video!=null){callback.onCustomViewHidden();return;}
    video=view;videoCallback=callback;
    root.addView(video,new FrameLayout.LayoutParams(-1,-1));
    web.setVisibility(View.GONE);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
   }
   @Override public void onHideCustomView(){hideVideo();}
  });
  web.setDownloadListener((url,agent,disposition,mime,length)->openExternal(Uri.parse(url)));
  if(state==null||web.restoreState(state)==null)web.loadUrl(HOME);
 }
 private boolean isVibe(Uri uri){
  return "https".equals(uri.getScheme())&&"lilesh0070.github.io".equals(uri.getHost())
   &&uri.getPath()!=null&&uri.getPath().startsWith("/vibe/");
 }
 private void openExternal(Uri uri){
  if(!"https".equals(uri.getScheme()))return;
  try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}
  catch(ActivityNotFoundException e){Toast.makeText(this,"Install a browser to open this link.",Toast.LENGTH_LONG).show();}
 }
 private void hideVideo(){
  if(video==null)return;
  root.removeView(video);video=null;web.setVisibility(View.VISIBLE);
  getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
  if(videoCallback!=null)videoCallback.onCustomViewHidden();
  videoCallback=null;
 }
 @Override public void onBackPressed(){
  if(video!=null)hideVideo();else if(web.canGoBack())web.goBack();else super.onBackPressed();
 }
 @Override protected void onSaveInstanceState(Bundle state){web.saveState(state);super.onSaveInstanceState(state);}
 @Override protected void onPause(){
  web.evaluateJavascript("document.querySelectorAll('audio,video').forEach(v=>v.pause());document.querySelectorAll('iframe').forEach(f=>{if(/youtube\\.com/.test(f.src))f.contentWindow.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), 'https://www.youtube.com')})",null);
  web.onPause();CookieManager.getInstance().flush();super.onPause();
 }
 @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
 @Override protected void onDestroy(){web.destroy();super.onDestroy();}
}
