import Settings from '../models/Settings.js';

export const getSettings = async (shopId) => {
  let settings = await Settings.findOne({ shop: shopId });
  if (!settings) {
    settings = await Settings.create({ shop: shopId });
  }
  return settings;
};

export const updateSettings = async (shopId, data) => {
  let settings = await Settings.findOne({ shop: shopId });
  if (!settings) {
    settings = await Settings.create({ shop: shopId });
  }
  Object.assign(settings, data);
  await settings.save();
  return settings;
};
