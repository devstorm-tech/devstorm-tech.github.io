import apiClient from './client';

const flattenValidationErrors = (error) => {
  const responseData = error?.response?.data;
  const errors = responseData?.errors;

  if (errors && typeof errors === 'object') {
    const flattened = Object.entries(errors)
      .flatMap(([field, messages]) => {
        if (Array.isArray(messages)) {
          return messages.map((message) => `${field}: ${message}`);
        }

        if (typeof messages === 'string') {
          return [`${field}: ${messages}`];
        }

        return [`${field}: ${String(messages)}`];
      })
      .join(' • ');

    if (flattened) {
      return flattened;
    }
  }

  if (typeof responseData?.message === 'string' && responseData.message) {
    return responseData.message;
  }

  return error?.message || 'Request failed';
};

export const listCourses = async () => {
  const response = await apiClient.get('/courses');
  return response.data;
};

export const createCourse = async (payload) => {
  console.log('📤 Sending payload:', payload);

  try {
    const response = await apiClient.post('/courses', payload);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 422) {
      throw new Error(flattenValidationErrors(error));
    }

    throw new Error(flattenValidationErrors(error));
  }
};

export const updateCourse = async (id, payload) => {
  console.log('📤 Sending payload:', payload);

  try {
    const response = await apiClient.put(`/courses/${id}`, payload);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 422) {
      throw new Error(flattenValidationErrors(error));
    }

    throw new Error(flattenValidationErrors(error));
  }
};

export const deleteCourse = async (id) => {
  const response = await apiClient.delete(`/courses/${id}`);
  return response.data;
};
