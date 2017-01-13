const KGROUPS = 8;
const MAX_ITR = 2;
const MAX_INT = 999;

var canvas;

//Image user preloaded, used to determine the size of the canvas
var img;

function debug(t){console.log(t)}

function preload(){
    img = loadImage("assets/test.jpg",64,64)
}

function getRandomColor(){
    return color(Math.random(0,256),Math.random(0,256),Math.random(0,256));
}

function createNexuses(){
    var ret = new Array(KGROUPS);
    for(var c = 0; c < KGROUPS; c++){
        ret [c] = getRandomColor()
    }
    return ret 
}
function calcColorDist(nexus, pixel){
    var h = Math.pow(hue(nexus) - hue(pixel),2)
    var s = Math.pow(saturation(nexus) - saturation(pixel),2)
    var b = Math.pow(brightness(nexus) - brightness(pixel),2)
    return Math.sqrt(h + s + b);
}
function relabelPixels(nexuses, pixels){
    debug("relabeling pixels")
    //Each index will store on Color Object
    var ret = new Array(img.width*img.height) 
    //Pixel values are stored as [r,g,b,a,r,g,b,a], so the color of (0,0) is actually index 0-3
    for(var p = 0; p < pixels.length; p+=4){
        
        var curPixel = color(pixels[p], pixels[p+1], pixels[p+2], pixels[p+3])  
        var bestNexus = 0
        var bestDist = MAX_INT

        for(var n = 0; n < nexuses.length; n++){
            var newDist = calcColorDist(nexuses[n], curPixel)
            if(newDist < bestDist){
                bestNexus = n
                bestDist = newDist
            }
        }
        ret[p/4] = bestNexus
    }   
    return ret
}

function averageLabels(nexuses, pixels, labels){
    debug("AVERAGING LABELS")
    var ret = new Array(nexuses.length)
        for(var n = 0; n < nexuses.length; n++){
            var count = 0
            var h = 0
            var s = 0
            var b = 0
            for(var p = 0; p < pixels.length; p+=4){
                var curColor = color(pixels[p], pixels[p+1], pixels[p+2], pixels[p+3])
                if(curColor == nexuses[n]){
                    count++
                    h+=hue(curColor)
                    s+=saturation(curColor)
                    b+=brightness(curColor)
                }
            }
            ret[n] = color(h/count,s/count,b/count)
        }
    return ret
}

function kmeans(img){
    debug("Begin KMEANS")
    var nexuses = createNexuses()
    var ret = new p5.Image(img.width,img.height)
    var labels = new Array(img.width*img.height)

    img.loadPixels()

    for(var i = 0; i < MAX_ITR; i++){

        //relabel pixels based on nexuses
        labels = relabelPixels(nexuses, img.pixels)
        //Remap nexuses 
        nexuses = averageLabels(nexuses, img.pixels, labels)
        }
    for(var x = 0; x < labels.length; x++){
       ret.set(x%img.width,Math.floor(x/img.width), nexuses[labels[x]])
    }
    console.log(red(ret.get(20,100)))
    ret.updatePixels()
    return ret
}

function setup() {
    canvas = createCanvas(img.width,img.height)
    img = kmeans(img)    
    noLoop()
}

function draw() {
    image(img,0,0)
}

