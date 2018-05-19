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
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        var gray = (pix[channel]*299+pix[channel+1]*587+pix[channel+2]*114)/1000;
        pix[channel] = pix[channel+1] = pix[channel+2] = gray;
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("rTransform").addEventListener("click", function () {
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        var r = pix[channel];
        pix[channel] = pix[channel+1] = pix[channel+2] = r;
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("gTransform").addEventListener("click", function () {
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        var g = pix[channel+1];
        pix[channel] = pix[channel+1] = pix[channel+2] = g;
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("bTransform").addEventListener("click", function () {
    currentImgData.data.set(imgData.data);
    var pix = currentImgData.data;
    for (var channel = 0; channel<pix.length; channel+=4){
        var b = pix[channel+2];
        pix[channel] = pix[channel+1] = pix[channel+2] = b;
    }
    plate.putImageData(currentImgData,0,0);
});

document.getElementById("histogramEqualization").addEventListener("click", function () {
    var pix = currentImgData.data;
    if (pix[0] === pix[1]){
        var pixNum = pix.length/4;
        var grayData = new Array(pixNum);
        var intensity = new Array(256);
        for (var channel = 0; channel<pixNum; channel++){
            grayData[channel] = pix[channel*4];
        }
        for (var i = 0; i<256; i++){
            intensity[i]=0;
            for (var j = 0; j<pixNum; j++){
                if (i === grayData[j]){
                    intensity[i] += 1;
                }
            }
        }
        for (var ch = 0; ch<pix.length; ch+=4){
            pix[ch] = Math.round(255*plus(intensity,pix[ch])/pixNum);
            pix[ch+1] = Math.round(255*plus(intensity,pix[ch+1])/pixNum)
            pix[ch+2] = Math.round(255*plus(intensity,pix[ch+2])/pixNum)
        }
        plate.putImageData(currentImgData,0,0);
        document.getElementById("find").addEventListener("click", function () {
            var intensit = document.getElementById("query").value;
            if (intensit && 0 <= intensit < 256){
                document.getElementById("monitor").innerHTML = intensity[intensit];
            }
        });
    }
});

document.getElementById("return").addEventListener("click", function () {
    plate.putImageData(imgData,0,0);
    currentImgData.data.set(imgData.data);
});

function plus(array,limit) {
    var sum = 0;
    for (var i = 0; i<=limit; i++){
        sum += array[i];
    }
    return sum;
}


