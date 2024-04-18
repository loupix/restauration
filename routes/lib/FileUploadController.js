var config = require('../../config/environment'),
  path = require("path"),
  fs = require("fs");

FileUploadController = function() {};

FileUploadController.prototype.uploadFile = function(req, res) {
  /**
   * The following takes the blob uploaded to an arbitrary location with
   * a random file name and copies it to the specified file.path with the file.name.
   * Note that the file.name should come from your upload request on the client side
   * because when the file is selected it is paired with its name. The file.name is
   * not random nor is the file.path.
   */

    // console.log(req.files);
  if(req.files.produit !== undefined)
    var file = req.files.produit.photo;
  else if(req.files.restaurant !== undefined)
    var file = req.files.restaurant.photo;
  else
    var file = req.files.file;

  fs.readFile(file.path, function (err, data) {
    // set the correct path for the file not the temporary one from the API:
    file.path = path.join(config.root, "public","images", file.name);

    // copy the data from the req.files.file.path and paste it to file.path
    fs.writeFile(file.path, data, function (err) {
      if (err) {
        console.warn(err);
        return res.status(409).json(err);
      }
      console.log("The file: " + file.name + " was saved to " + file.path);
      return res.status(200).json(file);
    });
  });
}

module.exports = new FileUploadController();