export const fetchProgramData = async (backend, userId) => {
  try {
    const response = await backend.get(
      `/program-directors/me/${userId}/program`
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching program data:', err);
    return null;
  }
};

export const fetchRegionData = async (backend, userId) => {
  try {
    const rdResponse = await backend.get(`/regional-directors/me/${userId}`);
    if (rdResponse.data?.regionId) {
      const regionResponse = await backend.get(
        `/region/${rdResponse.data.regionId}`
      );
      return regionResponse.data;
    }
    return null;
  } catch (err) {
    console.error('Error fetching region data:', err);
    return null;
  }
};
