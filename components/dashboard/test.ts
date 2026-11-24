const pd = {
  date: "Date",
  batches: {
    soursop: {
      small: 100,
      large: 200,
      usedfruitKgs: 50,
      rawMaterials: {
        sugar: 65,
        citricAcid: 10,
        salt: 5,
      },
    },
    tamarind: {
      small: 100,
      large: 200,
      usedfruitKgs: 65,
      rawMaterials: {
        sugar: 65,
        citricAcid: 10,
        salt: 5,
      },
    },
  },
  notes:
    "this is optional property if the user has any notes to add about the production data",
};

// okay now in order to create a production batch in the production table in
//     the database the frontend will send these data: Date, Flavor, used fruit KGs,
//     produced large bottles qty of this flavor, produced small bottles qty of this flavor.
//         Apart from these we send raw materials as well from the frontend.Its working like this :
// qty of small glass bottles and large bottles, lids, labels will be updated automatically according
//  to the qty of large bottles and small bottles.Let's say we produce 100 small bottles
//  and 200 large bottles of soursop.
//  Then it should automatically know that there are 100 empties small bottles,
//     and 200 empty large bottles.And also there's no any size difference between
//     large and small bottles for labels and lids.
//     according to this scenario used lids and labels qty for this production is 300 lids and 300 labels.
//     And also the user is able to add another raw materials from the frontend form.There's a input to
//     add more raw materials there's a dropdown menu of predefined
//     raw material types from the system like Sugar(Kg),
//     Citric acid(ml), LPG(Cylinders) etc..
// Then user will a raw material and type the units and submit the form finally.
