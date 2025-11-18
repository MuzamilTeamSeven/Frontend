import Swal, { SweetAlertIcon } from 'sweetalert2';

export const showAlert = (
  title: string,
  text: string,
  icon: SweetAlertIcon = 'info'
) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#0d6efd',
  });
};

export const showSuccess = (text: string, title: string = 'Success') => {
  return showAlert(title, text, 'success');
};

export const showError = (text: string, title: string = 'Error') => {
  return showAlert(title, text, 'error');
};

export const showWarning = (text: string, title: string = 'Warning') => {
  return showAlert(title, text, 'warning');
};

export const showInfo = (text: string, title: string = 'Info') => {
  return showAlert(title, text, 'info');
};

export const showConfirm = (
  title: string = 'Are you sure?',
  text: string = "You won't be able to revert this!",
  confirmButtonText: string = 'Yes',
  cancelButtonText: string = 'Cancel',
  icon: SweetAlertIcon = 'question'
): Promise<boolean> => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#6c757d',
    confirmButtonText,
    cancelButtonText,
  }).then((result) => result.isConfirmed);
};

export const showDeleteConfirm = (
  itemName: string = 'this item'
): Promise<boolean> => {
  return showConfirm(
    'Delete?',
    `Are you sure you want to delete ${itemName}?`,
    'Yes, delete it',
    'No, keep it',
    'warning'
  );
};

export const showUpdateConfirm = (
  itemName: string = 'this record'
): Promise<boolean> => {
  return showConfirm(
    'Update?',
    `Are you sure you want to update ${itemName}?`,
    'Yes, update',
    'Cancel',
    'question'
  );
};

export const showDangerWarning = (
  text: string = 'Something went wrong!',
  title: string = 'Warning'
) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonColor: '#dc3545',
  });
};
