import spawnAsync from '@expo/spawn-async';
import { execSync } from 'child_process';

import { confirmAsync } from '../../../../utils/prompts';
import { XcrunPrerequisite } from '../XcrunPrerequisite';

const asMock = (fn: any): jest.Mock => fn;

jest.mock(`../../../../log`);
jest.mock('../../../../utils/prompts');
jest.mock('@expo/spawn-async');
jest.mock('child_process', () => {
  return {
    execSync: jest.fn(),
  };
});

it(`detects that xcrun is installed and is valid`, async () => {
  // Mock xcrun installed for CI
  asMock(execSync).mockReset().mockReturnValueOnce(`xcrun version 60.`);

  // Ensure the confirmation is never called.
  asMock(confirmAsync)
    .mockReset()
    .mockImplementation(() => {
      throw new Error("shouldn't happen");
    });

  await XcrunPrerequisite.instance.assertImplementation();
});

it(`asserts that xcrun is not installed and installs it successfully`, async () => {
  asMock(spawnAsync).mockReset();
  // Mock xcrun installed for CI
  asMock(execSync)
    .mockReset()
    .mockImplementationOnce(() => {
      throw new Error('foobar');
    })
    .mockReturnValueOnce(`xcrun version 60.`);

  asMock(confirmAsync)
    .mockReset()
    // Invoke the confirmation
    .mockReturnValueOnce(true)
    .mockImplementation(() => {
      throw new Error("shouldn't happen");
    });

  await XcrunPrerequisite.instance.assertImplementation();
  // await expect(XcrunPrerequisite.instance.assertImplementation()).rejects.toThrowError();
  expect(spawnAsync).toBeCalledWith('sudo', ['xcode-select', '--install']);
});

it(`asserts that xcrun is not installed and the user cancels`, async () => {
  asMock(spawnAsync).mockReset();
  // Mock xcrun installed for CI
  asMock(execSync)
    .mockReset()
    .mockImplementationOnce(() => {
      throw new Error('foobar');
    })
    .mockReturnValueOnce(`xcrun version 60.`);

  asMock(confirmAsync)
    .mockReset()
    // Invoke the confirmation
    .mockReturnValueOnce(false)
    .mockImplementation(() => {
      throw new Error("shouldn't happen");
    });

  await expect(XcrunPrerequisite.instance.assertImplementation()).rejects.toThrowError();
  expect(spawnAsync).not.toBeCalled();
});
