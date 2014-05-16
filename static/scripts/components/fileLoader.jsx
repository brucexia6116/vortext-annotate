/* -*- mode: js2; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; js2-basic-offset: 2 -*- */
define(['react', 'jQuery'], function(React, $) {
  'use strict';

  // from http://stackoverflow.com/questions/12092633/pdf-js-rendering-a-pdf-file-using-a-base64-file-source-instead-of-url
  var BASE64_MARKER = ';base64,';
  function convertDataURIToBinary(dataURI) {
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(var i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  return React.createClass({
    loadExample: function() {
      var self = this;
      // From http://stackoverflow.com/questions/18447468/jquery-ajax-downloading-incomplete-binary-file
      var request = new XMLHttpRequest();
      request.open("GET", "/static/examples/TestDocument3.pdf", true);
      request.responseType = "arraybuffer";

      request.onload = function (e) {
        var arrayBuffer = request.response; // Note: not request.responseText
        if (arrayBuffer) {
          var byteArray = new Uint8Array(arrayBuffer);
          for (var i = 0; i < byteArray.byteLength; i++) {
            self.props.model.set({data:byteArray});
          }
        }
      };
      request.send(null);
    },
    loadFile: function() {
      var self = this;
      var file = this.refs.file.getDOMNode().files[0];
      if (file.type.match(this.props.mimeType)) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var data =  convertDataURIToBinary(reader.result);
          self.props.model.set({data:data});
        };
        reader.readAsDataURL(file);
      } else {
        alert("File not supported! Probably not a PDF");
      }
      return false;
    },
    render: function() {
      return(
         <form enctype="multipart/form-data" onSubmit={this.loadFile}>
          <input name="file" type="file" ref="file" />
           <input onClick={this.loadExample} type="button" className="button secondary tiny" value="Example" />
           <input type="submit" className="button tiny" value="Upload" />
         </form>);
    }
  });

});
