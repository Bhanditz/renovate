const fs = require('fs');
const got = require('../../lib/util/got');
const datasource = require('../../lib/datasource');

jest.mock('../../lib/util/got');

const allResponse = fs.readFileSync('test/_fixtures/gradle-wrapper/all.json');

let config = {};

describe('datasource/gradle', () => {
  describe('getPkgReleases', () => {
    beforeEach(() => {
      config = {
        gradleWrapperType: 'bin',
        typeStrategy: 'auto',
        digests: 'true',
        digestsStrategy: 'true',
      };
      jest.clearAllMocks();
      global.repoCache = {};
      return global.renovateCache.rmAll();
    });

    it('returns null for empty result', async () => {
      got.mockReturnValueOnce({ body: {} });
      expect(
        await datasource.getPkgReleases({ purl: 'pkg:gradleVersion' }, config)
      ).toBeNull();
    });

    it('throws for 404', async () => {
      got.mockImplementationOnce(() =>
        Promise.reject({
          statusCode: 404,
        })
      );
      let e;
      try {
        await datasource.getPkgReleases({ purl: 'pkg:gradleVersion' }, config);
      } catch (err) {
        e = err;
      }
      expect(e).toBeDefined();
    });

    it('returns null for unknown error', async () => {
      got.mockImplementationOnce(() => {
        throw new Error();
      });
      expect(
        await datasource.getPkgReleases({ purl: 'pkg:gradleVersion' }, config)
      ).toBeNull();
    });

    it('processes real data', async () => {
      got.mockReturnValueOnce({
        body: JSON.parse(allResponse),
      });
      const res = await datasource.getPkgReleases(
        { purl: 'pkg:gradleVersion' },
        config
      );
      expect(res).toMatchSnapshot();
      expect(res).not.toBeNull();
    });
  });
});
