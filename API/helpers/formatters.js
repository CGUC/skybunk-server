const express = require('express');

const config = require('../config/options');

/**
 * Dispatch errors in an appropriate format corresponding to their type.
 * If error is an object, it is an internal server error (ie something broke).
 * If it is a string, it is a rejection message raised due to an invalid operation
 * according to our business logic, for example attempting to create an existing channel.
 */
exports.classifyError = (err) => {
  if (typeof err === 'object') {
    return ({ status: 500, message: err.message });
  } else if (typeof err === 'string') {
    return ({ status: 403, message: err });
  } else {
    raise (new Error(`Invalid error type supplied to errors.classifyError: ${err}`));
  }
}

/**
 * Ensure tags stored in database are an array of lower-case strings
 * @param {iterable} tagsObj
 * @return {array}
 */
exports.formatTags = (tags) => {
  var formattedTags = [];
  if (typeof tags === 'object') {
    tags.forEach((tag) => {
      formattedTags.push(tag.toLowerCase());
    });
  } else if (typeof tags === 'string') {
    formattedTags.push(tags.toLowerCase());
  } else if (typeof tags === 'number') {
    formattedTags.push(`${tags}`);
  } else return null;
  return formattedTags;
}