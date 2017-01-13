const KGROUPS = 8;
const MAX_ITR = 20;
const MAX_INT = 999;

var canvas;

//Image user preloaded, used to determine the size of the canvas
var img;

function preload(){
    img = loadImage("assets/test.jpg",640,480)
    
}

function getRandomColor(){
    return color(Math.random(0,256),Math.random(0,256),Math.random(0,256));
}

function createNexi(){
    var labels = new Array(KGROUPS);
    for(var c = 0; c < KGROUPS; c++){
        labels[c] = getRandomColor()
    }
    return labels
}
function calcColorDist(nexus, pixel){
    /*var h = Math.pow(hue(nexus) - hue(pixel),2)
    var s = Math.pow(saturation(nexus) - saturation(pixel),2)
    var b = Math.pow(brightness(nexus) - brightness(pixel),2)
    return Math.sqrt(h + s + b);*/
    var h = hue(nexus) - hue(pixel)
    h = h*h
    var s = saturation(nexus) - saturation(pixel)
    s = s*s
    var b = brightness(nexus) - brightness(pixel)
    b = b*b
    return Math.sqrt(h + s + b)
}
function relabelPixels(nexi, pixels){
   var ret = new Array(img.width*img.height) 
    for(var p = 0; p < pixels.length; p++){
        var curPixel = pixels[p]
        var bestNexus = 0
        var bestDist = MAX_INT
        for(var n = 0; n < nexi.length; n++){
            var newDist = calcColorDist(nexi[n], pixels)
            if(newDist < bestDist){
                bestNexus = n
                bestDist = newDist
            }
        }
        ret[p] = bestNexus
    }
   return ret
}

function averageLabels(nexi, pixels, labels){
    var ret = new Array(nexi.length)
    for(var n = 0; n < nexi.length; n++){
        var count = 0
        var h = 0
        var s = 0
        var b = 0
        for(var p = 0; p < labels.length; p++){
            if(p == n){
                count++
                h+=hue(pixels[p])
                s+=saturation(pixels[p])
                b+=brightness(pixels[p])
            }
        }
        ret[n] = color(h/count,s/count,b/count)
    }
    return ret
}

function kmeans(img){
    var nexi = createNexi()
    
    var ret = new p5.Image(img.width,img.height)
    var labels = new Array(img.width*img.height)
    for(var i = 0; i < MAX_ITR; i++){
        
        //relabel pixels based on nexi
        labels = relabelPixels(nexi, labels)
        //Remap nexi 
        nexi = averageLabels(nexi, img.pixels, labels)
    }

    return ret
}

function setup() {
    canvas = createCanvas(img.width,img.height)
    img = kmeans(img);    
    noLoop()
}

function draw() {
    image(img,0,0)
}

