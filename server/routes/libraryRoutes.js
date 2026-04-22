const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

router.post('/', libraryController.addToLibrary);
router.get('/:userId', libraryController.getUserLibrary);
router.patch('/:id', libraryController.updateLibraryStatus);
router.delete('/:id', libraryController.removeFromLibrary);

module.exports = router;
