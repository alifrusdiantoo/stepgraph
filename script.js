let toogle = document.getElementById('toogle');
let nav = toogle.getElementsByClassName('nav-link');

for (var i = 0; i < nav.length; i++) {
  nav[i].addEventListener('click', function () {
    var current = document.getElementsByClassName('active');
    current[0].className = current[0].className.replace(' active', '');
    this.className += ' active';
  });
  nav[i].addEventListener('click', toggle);
}

function toggle() {
  let active = document.querySelector('.active').id;

  console.log(active);

  let dec = document.getElementById('decrypt-content');
  let en = document.getElementById('encrypt-content');
  let en2 = document.getElementById('encrypt-content-2');

  if (active == 'encrypt') {
    dec.style.display = 'none';
    en.style.display = 'block';
    en2.style.display = 'block';
  } else {
    dec.style.display = 'block';
    en.style.display = 'none';
    en2.style.display = 'none';
  }
}

// Image Upload
const dropArea = document.getElementById('drop-area');
const inputFile = document.getElementById('inputImage');
const imageView = document.getElementById('img-view');

inputFile.addEventListener('change', uploadImage);

function uploadImage() {
  let imgLink = URL.createObjectURL(inputFile.files[0]);
  imageView.style.backgroundImage = `url(${imgLink})`;
  imageView.textContent = '';
  dropArea.style.border = 0;
}

dropArea.addEventListener('dragover', function (e) {
  e.preventDefault();
});

dropArea.addEventListener('drop', function (e) {
  e.preventDefault();
  inputFile.files = e.dataTransfer.files;
  uploadImage();
});

// Algoritma
function KSA(key) {
  var s = [];
  for (var i = 0; i < 256; i++) {
    s[i] = i;
  }
  var j = 0;
  for (var i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    var temp = s[i];
    s[i] = s[j];
    s[j] = temp;
  }
  return s;
}

function PRGA(s) {
  var i = 0;
  var j = 0;
  var key = '';
  for (var n = 0; n < 256; n++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    var temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    var k = s[(s[i] + s[j]) % 256];
    key += String.fromCharCode(k);
  }
  return key;
}

function encryptRC4(text, key) {
  var s = KSA(key);
  var keyStream = PRGA(s);
  var res = '';
  for (var i = 0; i < text.length; i++) {
    res += String.fromCharCode(text.charCodeAt(i) ^ keyStream.charCodeAt(i % keyStream.length));
  }
  console.log(res);
  return res;
}

// Function untuk menyisipkan pesan ke dalam gambar
function hideMessage() {
  // Get value
  var input = document.getElementById('inputImage');
  var output = document.getElementById('outputImage');
  var message = document.getElementById('message').value;
  var password = document.getElementById('password').value;
  //Checking input
  if (!input.files[0]) {
    alert('Please select an image.');
    return;
  }

  if (!message) {
    alert('Please enter a message.');
    return;
  }

  if (!password) {
    alert('Please enter a password.');
    return;
  }
  // Create element <canvas>
  var canvas = document.createElement('canvas');
  console.log(canvas);
  // Mendapatkan konteks gambar 2D untuk memanipulasi canvas
  var ctx = canvas.getContext('2d');
  console.log(ctx);
  // Membuat objek image
  var img = new Image();
  console.log(img);
  // Fungsi ketika memuat gambar
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    // Menggambar pada image dengan koordinat (0, 0)
    ctx.drawImage(img, 0, 0);
    console.log(ctx.drawImage(img, 0, 0));
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(imageData);
    var data = imageData.data;
    console.log(data);
    // Enkripsi pesan dengan RC4
    var encryptedMessage = encryptRC4(message, password);
    var binaryMessage = '';
    // konversi karakter pesan ke biner
    for (var i = 0; i < encryptedMessage.length; i++) {
      binaryMessage += encryptedMessage[i].charCodeAt(0).toString(2).padStart(8, '0');
    }
    console.log(binaryMessage);
    // cek apakah pesan tidak melebihi batas image
    if (binaryMessage.length > data.length * 3) {
      alert('Message is too large to hide in this image.');
      return;
    }
    // Tahap penyisipan pesan ke dalam gambar
    var index = 0;
    // iterasi untuk mengakses setiap pixel warna RGBA
    for (var i = 0; i < data.length; i += 4) {
      for (var j = 0; j < 3; j++) {
        // penyisipan sepanjang pesan
        if (index < binaryMessage.length) {
          console.log(data[i + j]);
          // proses penyisipan setiap bit pesan ke dalam ujung kanan bit pada setiap byte RGB
          data[i + j] = (data[i + j] & 0xfe) | parseInt(binaryMessage[index]);
          index++;
          console.log(data[i + j]);
        }
      }
    }
    // menggambar image hasil modifikasi/penyisipan ke dalam canvas
    ctx.putImageData(imageData, 0, 0);
    output.src = canvas.toDataURL();
    console.log(output.src);
    document.getElementById('downloadButton').style.display = 'block';
  };
  img.src = URL.createObjectURL(input.files[0]);
  console.log(img.src);
}
// fungsi untuk mendownload image stegano
function downloadImage() {
  var output = document.getElementById('outputImage');
  var link = document.createElement('a');
  link.href = output.src;
  link.download = 'stego_image.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// fungsi untuk mengekstrak pesan dalam gambar
function extractMessage() {
  var input = document.getElementById('inputImage');
  var messageInput = document.getElementById('message').value;

  if (!input.files[0]) {
    alert('Please select an image.');
    return;
  }
  // inisialisasi gambar ke dalam canvas dan pengambilan data gambar
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    // Tahap ekstraksi pesan dalam gambar
    var binaryMessage = '';
    var index = 0;
    var message = '';
    for (var i = 0; i < data.length; i += 4) {
      for (var j = 0; j < 3; j++) {
        // mengambil bit terakhir pada setiap ujung kanan bit RGB
        binaryMessage += data[i + j] & 1;
        index++;
        // membentuk setiap 8 bit pesan yang diekstrak menjadi 1 byte karakter
        if (index % 8 === 0) {
          var byte = parseInt(binaryMessage, 2);
          if (byte === 0) {
            // End of message
            document.getElementById('ciphertext').value = message;
            return; // Keluar dari loop dan fungsi ekstraksi pesan
          }
          // konversi dari angka menjadi karakter dalam ascii
          message += String.fromCharCode(byte);
          binaryMessage = '';
        }
      }
    }
  };
  img.src = URL.createObjectURL(input.files[0]);
}

function decryptMessage() {
  var ciphertext = document.getElementById('ciphertext').value;
  var password = document.getElementById('decryptPassword').value;

  if (!ciphertext) {
    alert('Please enter ciphertext.');
    return;
  }

  if (!password) {
    alert('Please enter a decryption password.');
    return;
  }

  var decryptedMessage = encryptRC4(ciphertext, password);
  document.getElementById('decryptedText').innerText = decryptedMessage;
}
