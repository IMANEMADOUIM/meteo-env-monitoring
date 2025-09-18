import Settings, { ISettings } from "../../models/Settings";


export const getSettingsByUser = async (userId: string): Promise<ISettings | null> => {
  return await Settings.findOne({ userId });
};

export const createDefaultSettings = async (userId: string): Promise<ISettings> => {
  let settings = await Settings.findOne({ userId });
  if (!settings) {
    settings = new Settings({ userId });
    await settings.save();
  }
  return settings;
};

export const updateSettings = async (userId: string, updates: Partial<ISettings>): Promise<ISettings | null> => {
  return await Settings.findOneAndUpdate({ userId }, updates, { new: true, upsert: true });
};
