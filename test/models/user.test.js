require('../../models/User');
require('../../models/Posts')
require('sinon-mongoose');
const mongoose = require('mongoose');
const chai = require('chai');
const sinon = require('sinon');
const UserFactory = require('../factories/users');
const NotificationFactory = require('../factories/notifications');
const bcrypt = require('bcryptjs');

const expect = chai.expect;
const User = mongoose.model('User');
const Post = mongoose.model('Post')
const Notification = mongoose.model('Notification')
const fred = UserFactory.fred

describe("Users", () => {
	before(() => {
		const save = sinon.stub(User.prototype, 'save').resolves(this);
	});

	describe("can be created", () => {
		it('with no errors', done => {
			const changePasswordStub = sinon.stub(User.prototype, 'changePassword').resolves(fred);
			
			User.create(fred).then(result => {
				expect(changePasswordStub.callCount).to.equal(1);
				expect(result.firstName).to.equal('fred');
				done();
			});
			changePasswordStub.restore();
		});

		it("with salted/hashed password", done => {
			User.create(fred).then(result => {
				expect(result.password).to.not.equal(fred.password)
				done()
			});
		});
	});

	describe("can be authenticated", () => {
		let findOneStub
		beforeEach(() => {
			findOneStub = sinon.stub(User.Query.base, 'findOne')
		})
		afterEach(() => {
			findOneStub.restore()
		})

		it("without errors", done => {
			findOneStub.resolves(fred);

			User.authenticate(fred.username, UserFactory.fredData.password).then(user => {
				expect(user._id).to.equal(fred._id)
				done()
			});
		})

		it("with proper errors when username is wrong", done => {
			findOneStub.resolves(undefined);

			User.authenticate('NotAUsername', fred.password).catch(err => {
				expect(err.message).to.equal('Username does not exist')
				done()
			});
		});

		it("with proper errors when password is wrong", done => {
			findOneStub.resolves(fred);

			User.authenticate(fred.username, 'wrongPassword').catch(err => {
				expect(err.message).to.equal('Password is incorrect')
				done()
			});
		});
	});

	describe("can manage notifications", () => {
		it("by successfully marking notifications as seen", done => {
			sinon
				.mock(User)
				.expects('findOne')
				.chain('populate')
				.withArgs('notifications')
				.resolves(fred);

			const markSeenStub = sinon.stub(Notification.prototype, 'markSeen').resolves(NotificationFactory.seenNotification())
			User.markNotifsSeen(1).then(result => {
				expect(markSeenStub.callCount).to.equal(fred.notifications.length)
				expect(result).to.equal(true)
				done()
			})
		});

		it("by successfully registering new notification tokens", done => {
			fred.notificationTokens = [];
			
			sinon.spy(fred, "registerNotificationToken");

			fred.registerNotificationToken('arandomtoken').then(token => {
				const spyCall = fred.registerNotificationToken.getCall(0);
				expect(token).to.equal('arandomtoken');
				expect(spyCall.thisValue.notificationTokens).to.include('arandomtoken');
				fred.registerNotificationToken.restore();
				done();
			})
		});

		it("by not registering duplicate notification tokens", done => {
			fred.notificationTokens = ['existingToken'];

			sinon.spy(fred, "registerNotificationToken");

			fred.registerNotificationToken('existingToken').then(token => {
				const spyCall = fred.registerNotificationToken.getCall(0);

				expect(token).to.equal('existingToken')
				expect(spyCall.thisValue.notificationTokens.length).to.equal(1);
				fred.registerNotificationToken.restore();
				done()
			});
		});
	})

	describe("can be modified", () => {
		it("by updating with no errors", done => {			
			sinon.spy(fred, "update");

			const newFred = {};
			Object.assign(newFred, UserFactory.fredData);
			newFred.firstName = 'Terrance';

			fred.update(newFred).then(user => {
				const spyCall = fred.update.getCall(0);
				expect(spyCall.thisValue.firstName).to.equal('Terrance');
				fred.update.restore();
				done();
			})
		});

		it("by updating the password with no errors", done => {
			sinon.spy(fred, "changePassword");

			fred.changePassword('notWilma').then(() => {
				const spyCall = fred.changePassword.getCall(0);

				bcrypt.compare('notWilma', spyCall.thisValue.password, (err, isMatch) => {
					expect(isMatch).to.equal(true);
					expect(err).to.equal(null);
					done()
				})
			})
		});

		it("by creating a new profile picture with no errors", () => {
			// TODO: We're robably gonna change the way we're handling photos anyways
		});

		it("by updating the profile picture with no errors", () => {
			// TODO: We're robably gonna change the way we're handling photos anyways
		});
	})

	describe("can retrieve", () => {
		it("posts from subscribed channels", done => {
			const getPostsStub = sinon.stub(Post, 'findByTags').resolves([])

			fred.getPostsFromSubs(1).then(() => {
				expect(getPostsStub.callCount).to.equal(1)
				expect(getPostsStub.args[0][0]).to.eql(['general', 'events'])
				done()
			})
		});

		it("profile picture", () => {
			// TODO: We're probably gonna change the way we're handling photos anyways
		});
	})
});