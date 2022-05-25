const { Thought, User } = require('../models');

const thoughtController = {
    getAllThoughts(req, res) {
        Thought.find({})
            .select('-__v')
            .then(dbThoughtData => res.json(dbThoughtData))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
            .select('-__v')
            .then(dbThoughtData => {
                if(!dbThoughtData) {
                    res.status(404).json({ message: 'No thought found with this id! '});
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    createThought({ body }, res) {
        Thought.create(body)
            .then(({ _id }) => {
                return User.findOneAndUpdate(
                { _id: body.userId },
                { $push: { thoughts: _id } },
                { new: true, runValidators: true }
                );
            })
            .then(dbUserData => {
                if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
    },

    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.id }, 
            body, 
            { new: true, runValidators: true })
            .then(dbThoughtData => {
                if(!dbThoughtData) {
                    res.status(404).json({ message: 'No thought found with this id!' });
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch(err => res.status(400).json(err));
    },

    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.id })
            .then(deletedThought => {
                return User.findOneAndUpdate(
                { username: deletedThought.username },
                { $pull: { thoughts: params.id } },
                { new: true }
                );
            })
            .then(deletedThought => {
                if(!deletedThought) {
                    return res.status(404).json({ message: 'No thought with this id!' });
                }
                res.json(deletedThought);
            })
            .catch(err => res.json(err));
    },

    createReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { runValidators: true, new: true }
        )
        .then(dbThoughtData => {
            if(!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbThoughtData);
        });
    },

    deleteReaction({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId } } },
            { runValidators: true, new: true }
        )
        .then(dbReactionData => {
            if(!dbReactionData) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbReactionData);
        });
    }
};

module.exports = thoughtController;