require('../../models/User');
const mongoose = require('mongoose');
const chai = require('chai');
const sinon = require('sinon');
const UserFactory = require('../factories/users');

const expect = chai.expect;
const User = mongoose.model('User');

describe("Users", () => {
	before(() => {
		const save = sinon.stub(User.prototype, 'save').resolves(UserFactory.fredData);
	});

	describe("can be created", () => {
		it('with no errors', done => {
			const changePasswordStub = sinon.stub(User.prototype, 'changePassword').resolves(UserFactory.userData);
			
			User.create(UserFactory.fredData).then(result => {
				expect(changePasswordStub.callCount).to.equal(1);
				expect(result.firstName).to.equal('fred');
				done();
			});
			changePasswordStub.restore();
		});

		it("with salted/hashed password", done => {
			User.create(UserFactory.fredData).then(result => {
				expect(result.password).to.not.equal(UserFactory.fredData.password)
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
			findOneStub.resolves(UserFactory.fredDocument);

			User.authenticate(UserFactory.fredData.username, UserFactory.fredData.password).then(user => {
				expect(user._id).to.equal(UserFactory.fredDocument._id)
				done()
			});
		})

		it("with proper errors when username is wrong", done => {
			findOneStub.resolves(undefined);

			User.authenticate('NotAUsername', UserFactory.fredData.password).catch(err => {
				expect(err.message).to.equal('Username does not exist')
				done()
			});
		});

		it("with proper errors when password is wrong", done => {
			findOneStub.resolves(UserFactory.fredDocument);

			User.authenticate(UserFactory.fredData.username, 'wrongPassword').catch(err => {
				expect(err.message).to.equal('Password is incorrect')
				done()
			});
		});
	});

	describe("can manage notifications", () => {
		it("by successfully marking notifications as seen", () => {

		});

		it("by giving appropriate errors when marking notifications as seen", () => {

		});

		it("by successfully registering new notification tokens", () => {

		});

		it("by not registering duplicate notification tokens", () => {

		});
	})

	describe("can be modified", () => {
		it("by updating with no errors", () => {

		});

		it("by updating the password with no errors", () => {

		});

		it("by creating a new profile picture with no errors", () => {

		});

		it("by updating the profile picture with no errors", () => {

		});
	})

	describe("can retrieve", () => {
		it("posts posts from subscribed channels", () => {

		});

		it("profile picture", () => {

		});
	})
});