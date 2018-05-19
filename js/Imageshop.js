var canvas = document.getElementById('canvas');
var plate = canvas.getContext("2d");
var imgData;
var currentImgData;
var img = new Image();

img.onload = function () {
    var imgWidth = img.width;
    var imgHeight = img.height;
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    plate.drawImage(img,0,0);
    imgData = plate.getImageData(0,0,imgWidth,imgHeight);
    currentImgData = plate.createImageData(imgData.width,imgData.height);
    currentImgData.data.set(imgData.data);
};
document.getElementById("browse").addEventListener("change", function () {
    if (this.files.length === 0){
        img.src = '';
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
});


document.getElementById("grayTransform").addEventListener("click", function () {
    initialize();
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        var gray = Math.round((pix[channel]*299+pix[channel+1]*587+pix[channel+2]*114)/1000);
        pix[channel] = pix[channel+1] = pix[channel+2] = gray;
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("rTransform").addEventListener("click", function () {
    initialize();
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        var r = pix[channel];
        pix[channel] = pix[channel+1] = pix[channel+2] = r;
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("gTransform").addEventListener("click", function () {
    initialize();
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        var g = pix[channel+1];
        pix[channel] = pix[channel+1] = pix[channel+2] = g;
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("bTransform").addEventListener("click", function () {
    initialize();
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        var b = pix[channel+2];
        pix[channel] = pix[channel+1] = pix[channel+2] = b;
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("histogramEqualization").addEventListener("click", function () {
    initialize();
    var pix = currentImgData.data;
    var pixNum = pix.length/4;
    var grayData = new Array(pixNum);
    var cbData = new Array(pixNum);
    var crData = new Array(pixNum);
    var intensities = new Array(256);



    for (var channel = 0; channel<pixNum; channel++){
        grayData[channel] = Math.round((pix[channel*4]*2990+pix[channel*4+1]*5870+pix[channel*4+2]*1140)/10000);
        cbData[channel] = (pix[channel*4]*(-1687)+pix[channel*4+1]*(-3313)+pix[channel*4+2]*5000)/10000;
        crData[channel] = (pix[channel*4]*5000-pix[channel*4+1]*4187+pix[channel*4+2]*813)/10000;
    }

    for (var i = 0; i<256; i++){
        intensities[i]=0;
        for (var j = 0; j<pixNum; j++){
            if (i === grayData[j]){
                intensities[i] += 1;
            }
        }
    }

    for (var ch = 0; ch<pix.length; ch+=4){
        var newIntensity = Math.round(255*plus(intensities,grayData[ch/4])/pixNum);
        if (pix[ch]===pix[ch+1]){  //To aim at the image that is a gray image
            pix[ch] = pix[ch + 1] = pix[ch + 2] = newIntensity;
        }
        else {
            pix[ch] = Math.round(newIntensity + 1.402 * crData[ch / 4]);
            pix[ch + 1] = Math.round(newIntensity - 0.34414 * cbData[ch / 4] - 0.71414 * crData[ch / 4]);
            pix[ch + 2] = Math.round(newIntensity + 1.772 * cbData[ch / 4]);
        }
    }

    plate.putImageData(currentImgData,0,0);
    document.getElementById("find").addEventListener("click", function () {
        var intensity = document.getElementById("query").value;
        if (intensity && 0 <= intensity < 256){
                document.getElementById("monitor").innerHTML = intensities[intensity];
        }
    });
});

document.getElementById("complement").addEventListener("click", function () {
    initialize();
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        pix[channel] = 255 - pix[channel];
        pix[channel+1] = 255 - pix[channel+1]
        pix[channel+2] = 255 - pix[channel+2];
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("binary").addEventListener("click", function () {
    initialize();
    var pix = currentImgData.data;
    if (pix[0]===pix[1]) {     //Only gray images supported
        var grayData = new Array(imgData.height);
        for (var k = 0; k<imgData.height; k++)
            grayData[k] = new Array(imgData.width);
        var dither = Number(document.getElementById("ditherMatrix").value);
        for (var x = 0; x<imgData.height; x++){
            for (var y = 0; y<imgData.width; y++){
                grayData[x][y] = Math.round(pix[4*(x*imgData.width+y)]/(256/(dither*dither+1)));
            }
        }

        if (document.getElementById("ordered").checked) {    //ordered dithering
            for (var i = 0; i<imgData.height; i++){
                x = i%dither;
                for (var j = 0; j<imgData.width;j++){
                    y = j%dither;
                    if (grayData[i][j]>ditherMatrixProduce(dither)[x][y]){
                        grayData[i][j] = 1;
                    }
                    else {
                        grayData[i][j] = 0;
                    }
                }
            }
            for (var channel = 0; channel<pix.length; channel+=4){
                var xIndex = ((channel/4)-((channel/4)%imgData.width))/imgData.width;
                var yIndex = (channel/4)%imgData.width;
                pix[channel] = pix[channel+1] = pix[channel+2] = 255*grayData[xIndex][yIndex];
            }
            plate.putImageData(currentImgData,0,0);

        }
        else {                //not ordered dithering
            var currentImgDataCopy = plate.createImageData(imgData.width*dither,imgData.height*dither);
            canvas.width = imgData.width*dither;
            canvas.height = imgData.height*dither;
            var pixel = currentImgDataCopy.data;
            var ditherData = new Array(imgData.height*dither);
            for (var u = 0; u<imgData.height*dither; u++)
                ditherData[u] = new Array(imgData.width*dither);
            for (var a = 0; a<imgData.height; a++){
                for (var b = 0; b<imgData.width;b++){
                    m = a*dither;
                    n = b*dither;
                    for (var aa = 0; aa<dither; aa++){
                        for (var bb = 0; bb<dither; bb++){
                            if (grayData[a][b]>ditherMatrixProduce(dither)[aa][bb]){
                                ditherData[m+aa][n+bb] = 1;
                            }
                            else {
                                ditherData[m+aa][n+bb] = 0;
                            }
                        }
                    }
                }
            }
            for (var ch = 0; ch<pixel.length; ch+=4){
                var indexX = ((ch/4)-((ch/4)%(imgData.width*dither)))/(imgData.width*dither);
                var indexY = (ch/4)%(imgData.width*dither);
                pixel[ch] = pixel[ch+1] = pixel[ch+2] = 255*ditherData[indexX][indexY];
                pixel[ch+3] = 255;
            }
            plate.putImageData(currentImgDataCopy,0,0);
        }
    }
});

document.getElementById("return").addEventListener("click", function () {
    initialize();
    plate.putImageData(imgData,0,0);
    currentImgData.data.set(imgData.data);
});

function initialize() {
    canvas.width = imgData.width;
    canvas.height = imgData.height;
}

function plus(array,limit) {
    var sum = 0;
    for (var i = 0; i<=limit; i++){
        sum += array[i];
    }
    return sum;
}

function ditherMatrixProduce(n) {
    if (n === 2){
        return [[0,2],
                [3,1]];
    }
    else {
        var mat = new Array(n);
        for (var k = 0; k<n; k++)
            mat[k] = new Array(n);
        var lastMat = ditherMatrixProduce(n/2);
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                if (i < n / 2 && j < n / 2) {
                    mat[i][j] = 4 * lastMat[i][j];
                }
                else if (i >= 2 / n && j < n / 2) {
                    mat[i][j] = 4 * lastMat[i - n / 2][j] + 3;
                }
                else if (i < n / 2 && j >= n / 2) {
                    mat[i][j] = 4 * lastMat[i][j - n / 2] + 2;
                } else {
                    mat[i][j] = 4 * lastMat[i - n / 2][j - n / 2] + 1;
                }
            }
        }
        return mat;
    }
}


