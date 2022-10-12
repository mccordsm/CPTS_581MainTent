/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';

suite('IconLabel', function () {
	function getPathMultipleOfTen(multiplier: Number) {
		const tenChars = '0123456789';
		let sum = tenChars;
		for (let timesMultiplied = 1; timesMultiplied < multiplier; timesMultiplied++) {
			sum += '/' + tenChars;
		}
		return sum;
	}
	assert.equal(getPathMultipleOfTen(1), '0123456789', 'getPathMultipleOfTen helper function is broken on 1');
	assert.equal(getPathMultipleOfTen(2), '0123456789/0123456789', 'getPathMultipleOfTen helper function is broken on 2');

	test('first folder is ... in larger than 35 char', function () {
		const path40 = getPathMultipleOfTen(4);
		assert.strictEqual(IconLabel.shortenPathFromLeft(path40, 38, 2), '.../' + getPathMultipleOfTen(3));
	});

	test('remove 3 folders', function () {
		const path60 = getPathMultipleOfTen(6);
		assert.strictEqual(IconLabel.shortenPathFromLeft(path60, 38, 2), '.../' + getPathMultipleOfTen(3));
	});
});
