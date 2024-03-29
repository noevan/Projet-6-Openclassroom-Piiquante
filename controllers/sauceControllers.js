const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  console.log(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    userLiked: [],
    userDisLiked: [],
  });
  sauce
    .save()
    .then(() => {
      res.status(200).json({ message: "Objet enregistré" });
    })
    .catch((error) => {
      res.status(400).json({ error });
      console.log(error);
    });
  };

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
      .then(sauce => {
        if (sauce.userId != req.auth.userId) {
          res.status(401).json({message: 'Not authorized'});
        } else {
          Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
          .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
          .catch(error => res.status(401).json({error}));
        }
      })
      .catch(error => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
      .then(sauce => {
        if (sauce.userId != req.auth.userId) {
          res.status(401).json({message: 'Not authorized'})
        } else {
          const filename = sauce.imageUrl.splut('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id: req.params.id})
              .then(() => {res.status(200).json({message: 'Sauce supprimée )'})})
              .catch(error => res.status(401).json({error}));
          });
        }
      })
      .catch(error => res.status(500).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({error}));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(400).json({error}));
};