const isdebug = 1;
const KGROUPS = 4;
const MAX_ITR = 20;
const MAX_INT = 999;
var canvas;

//Image user preloaded, used to determine the size of the canvas
var img;

function debug(t){
	if(isdebug == 1){
		console.log(t)
	}
}

function preload(){
    img = loadImage("assets/test.jpg")
}

function getRandomColor(){
    var ret = color(Math.random()*256,Math.random()*256,Math.random()*256);
    return ret
}

function createNexuses(){
    debug("RANDOMIZING NEXUSES")
    var ret = new Array(KGROUPS);
    for(var c = 0; c < KGROUPS; c++){
        ret[c] = getRandomColor()
	debug("R: " + red(ret[c]) + " B: " + blue(ret[c]) + " G: " + green(ret[c]))
    }
    return ret 
}
function calcColorDist(nexus, pixel){
    var h = Math.pow(hue(nexus) - hue(pixel),2)
    var s = Math.pow(saturation(nexus) - saturation(pixel),2)
    var b = Math.pow(brightness(nexus) - brightness(pixel),2)
    return Math.sqrt(h + s + b);
}
function relabelPixels(nexuses, img){
    debug("relabeling pixels")
    //Each index will store on Color Object
    var ret = new Array(img.width*img.height) 
    //Pixel values are stored as [r,g,b,a,r,g,b,a], so the color of (0,0) is actually index 0-3
    for(var p = 0; p < img.width*img.height; p++){
        
        var curPixel = img.get(p%img.width,Math.floor(p/img.width))  
        var bestNexus = 0
        var bestDist = MAX_INT

        for(var n = 0; n < nexuses.length; n++){
            var newDist = calcColorDist(nexuses[n], curPixel)
            if(newDist < bestDist){
                bestNexus = n
                bestDist = newDist
            }
        }
        ret[p] = bestNexus
    }   
    debug("retcol: " + red(ret))
    return ret
}

function averageLabels(nexuses, img, labels){
    debug("AVERAGING LABELS")
    var ret = new Array(nexuses.length)
    for(var n = 0; n < nexuses.length; n++){
        var count = 0.0
        var r = 0
        var g = 0
        var b = 0
        for(var p = 0; p < img.width*img.height; p++){
            var curColor = img.get(p%img.width,Math.floor(p/img.width))
            if(labels[p] == n){
                count++
                r+=red(curColor)
                g+=green(curColor)
                b+=blue(curColor)
            }
        }
        debug("red: " + (r/count) + " green: "+ (g/count) +" blue: " +  (b/count))
	ret[n] = color(r/count,g/count,b/count)
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
        labels = relabelPixels(nexuses, img)
        //Remap nexuses 
        nexuses = averageLabels(nexuses, img, labels)
    }
    for(var x = 0; x < labels.length; x++){
       ret.set(x%img.width,Math.floor(x/img.width), nexuses[labels[x]])
    }
    ret.updatePixels()
    return ret
}

function setup() {
    //canvas = createCanvas(img.width,img.height)
    canvas = createCanvas(640,480)
    img.resize(640,480)
    img = kmeans(img)    
    noLoop()
}

function draw() {
    image(img,0,0)
}

