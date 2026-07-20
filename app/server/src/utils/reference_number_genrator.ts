//file to create/pad out a human readable reference number for each query

const generate_ref_number = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const num = String(Math.floor(Math.random() * 10000)).padStart(4, "0");

  return `Q-${year}${month}${day}-${num}`;
};

export default generate_ref_number;
