import { PresidentsLetter, PresidentsLetterModel } from "./models";

const getLetter = async () => PresidentsLetterModel.findOne();

const updateLetter = async (updates: Partial<PresidentsLetter>) =>
  PresidentsLetterModel.findOneAndUpdate(
    {},
    {
      ...updates,
      updatedAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

export default {
  getLetter,
  updateLetter,
};
