Modifying the spotfire-wrapper
==================================================

Use two shell windows to accomplish the live build.

## Step 1

<pre>
// build the spotfire-library in build dir
Shell#1 $ ng build spotfire-wrapper
</pre>

## Step 2

<pre>// do a link to the library just built (might need `npm config set prefix '~/.npm-global'`)

Shell#2 $ npm link build/spotfire-wrapper</pre>

## Step 3

<pre>
// start the server for demo1
Shell#2 $ ng serve demo1 --port=4205 -o

// build and watch
Shell#1 $ ng build spotfire-wrapper --watch</pre>
