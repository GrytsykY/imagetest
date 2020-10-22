let db;
const databaseName = "ImageDb";
let dbVersion = 1;
let dbReady = false;

const btnDelete = document.getElementById("btn-delete");
const btnUpdate = document.getElementById("btn-update");

document.addEventListener('DOMContentLoaded', () => {

  document.querySelector('#pictureTest').addEventListener('change', doFile);
  initDb();
});


function initDb() {
  let request = indexedDB.open(databaseName, dbVersion);

  request.onerror = function (e) {
    console.error('Unable to open database.');
  }

  request.onsuccess = function (e) {
    db = e.target.result;
    doImageTest();
    console.log('db opened');
  }

  request.onupgradeneeded = function (e) {
    let db = e.target.result;
    db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
    dbReady = true;
  }
}

function doFile(e) {
  console.log('change event fired for input field');
  $('.form').css('display', 'none');
  let file = e.target.files[0];
  let size = parseFloat((file.size / 1024 / 1000).toFixed(3));
  let name = file.name;
  let type = file.type;
  let date = file.lastModifiedDate.toLocaleDateString();
  console.log("=====================");

  var reader = new FileReader();
  //				reader.readAsDataURL(file);
  reader.readAsDataURL(file);
  let w = 0, h = 0, album = "";
  reader.onload = function (e) {
    const image = new Image();
    image.src = e.target.result;

    image.onload = function () {
      h = this.height;
      w = this.width;
      return false;
    };
  }

  var reader = new FileReader();
  reader.readAsBinaryString(file);

  if (type == 'image/jpeg' ||
    type == 'image/jpg' ||
    type == 'image/png' ||
    type == 'image/gif') {
    reader.onload = function (e) {
      //alert(e.target.result);
      let bits = e.target.result;
      bits = bits; //console.log(bits + " ->IMG") 
      setTimeout(() => {
        if (w > h) {
          album = "портрет";
        } else if (w == h) {
          album = "квадрат";
        } else {
          album = "альбом";
        }
        let ob = {
          created: new Date(),
          name, size, type, date, bits, album, w, h
        };

        let trans = db.transaction(['images'], 'readwrite');
        let addReq = trans.objectStore('images').add(ob);

        addReq.onerror = function (e) {
          console.log('error storing data');
          console.error(e);
        }

        trans.oncomplete = function (e) {
          console.log('data stored');
          $("#pictureTest").val('');
          doImageTest()
        }
      }, 100);
    }
  } else {
    alert("Неверный формат!!!")
  }

}

function doImageTest() {

  var content = $('tbody#tbody');
  content.empty();
  let trans = db.transaction(['images'], 'readonly');
  //hard coded id
  let req = trans.objectStore('images').getAll();
  //let req = trans.objectStore('cachedForms').get(1); console.log(req);
  req.onsuccess = (e) => {
    let records = e.target.result;
    for (let i = 0; i < records.length; i++) {
      if (records[i].bits === undefined) {
        var bits = "./nofile.png";
        console.log("NO FILED")
      } else {
        if ((/data:image/).test(records[i].bits)) {
          var bits = records[i].bits; console.log("NOOOOO")
        } else {
          var bits = "data:image/jpeg;base64," + btoa(records[i].bits);
        }
      }
      content.append('\
        <tr>\
        <td><img height="70px" src="'+ bits + '"></td>' +
        '<td>' + records[i].name + '</td><td>'
        + records[i].size + '</td><td>'
        + records[i].type + '</td><td>'
        + records[i].date + '</td><td>'
        + records[i].album + '</td><td>'
        + records[i].w + '</td><td>'
        + records[i].h + '</td><td><i class="fas fa-edit btnEdit" onclick="edit(' + records[i].id + ')">'
        + '</i></td><td><i class="fas fa-trash-alt delBtn" onclick="deleteBtn(' + records[i].id + ')"></i></td>' +
        '</i></td><td><i class="fas fa-download downBtn" onclick="downImg(' + records[i].id + ')"></i></td>' +
        '</tr>\
      ');
    }
  }
}


function edit(id) {
  $('.form').css('display', 'block');

  var request = db.transaction(["images"], "readwrite")
    .objectStore("images")
    .get(id);
  request.onsuccess = function (event) {
    var img = request.result;
    if ((/data:image/i).test(img.bits)) {
      $('#image').attr('src', img.bits);
    } else {
      $('#image').attr('src', 'data:image/jpeg;base64,' + btoa(img.bits));
    }
    $("#id").val(img.id);
    $("#name").val(img.name);
    $("#size").val(img.size);
    $("#type").val(img.type);
    $("#date").val(img.date);
    $("#album").val(img.album);
    $("#w").val(img.w);
    $("#h").val(img.h);
  };

  return false;
}

// UPDATE
$("#btn-update").on("click", async function (event) {
  event.preventDefault();
  $('.form').css('display', 'none');

  var file = $('#img').prop('files');
  if (file[0] === undefined) {
    var id = $("#id").val();
    var img = $('img').attr('src');
    var name = $("#name").val();
    var size = $("#size").val();
    var type = $("#type").val();
    var date = $("#date").val();
    var album = $("#album").val();
    var w = $("#w").val();
    var h = $("#h").val();

  } else {

    var reader = new FileReader();
    reader.readAsDataURL(file[0]);
    var w = 0, h = 0, album = "";
    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target.result;

      image.onload = function () {
        h = this.height;
        w = this.width;
        return false;
      };
    }

    var id = $("#id").val();
    var size = parseFloat((file[0].size / 1024 / 1000).toFixed(3));
    var name = file[0].name;
    var type = file[0].type;
    var date = file[0].lastModifiedDate.toLocaleDateString();
    if (type == 'image/jpeg' ||
      type == 'image/jpg' ||
      type == 'image/png' ||
      type == 'image/gif') {

      var reader = new FileReader();
      reader.readAsBinaryString(file[0]);

      var img;
      reader.onload = function (e) {
        //alert(e.target.result);
        img = e.target.result;
        //console.log(img + "IMages")
      }
    } else {
      alert("Неверный формат!!!")
    }
  }
  setTimeout(() => {
    addEdit(id, img, name, size, type, date, w, h);
    doImageTest();
    $("#img").val('');
  }, 100);
  return false;
});

function addEdit(id, img, name, size, type, date, w, h) {
  var t = db.transaction(["images"], "readwrite");
  console.log("VXOD")
  var album;
  if (w > h) {
    album = "портрет";
  } else if (w == h) {
    album = "квадрат";
  } else {
    album = "альбом";
  }

  t.objectStore("images")
    .put({
      bits: img,
      name: name,
      size: size,
      type: type,
      date: date,
      album: album,
      w: w,
      h: h,
      updated: new Date(), id: Number(id)
    });
  $('.form').css('display', 'none');
}

btnDelete.onclick = (e) => {
  let del = indexedDB.deleteDatabase(databaseName);
}

function deleteBtn(id) {
  let transaction = db.transaction("images", "readwrite");
  let objectStore = transaction.objectStore("images");
  let request = objectStore.delete(id);
  request.onsuccess = function (evt) {
    console.log("deleted content");
  };
  $('.form').css('display', 'none');
  doImageTest();
}

function downImg(id) {
  let trans = db.transaction(['images'], 'readonly');
  let req = trans.objectStore('images').get(id);
  req.onsuccess = (e) => {
    var rec = e.target.result;
    if ((/data:image/i).test(rec.bits)) {
      $('#save').html('<a class="save" href="' + rec.bits + '" download="' + rec.name + '"></a>');
    } else {
      $('#save').html('<a class="save" href="' +'data:image/jpeg;base64,'+ btoa(rec.bits) + '" download="' + rec.name + '"></a>');
    }
    document.getElementsByClassName("save")[0].click();
    console.log(rec + " RED")
  }
}