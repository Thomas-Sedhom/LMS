import { PaginationDTO } from "../../../common/dto/pagination.dto";
import { Model } from "mongoose";

export const PaginationUtil= async <T> (paginationQuery: PaginationDTO, Model: Model<T>, filter?: any, populate1?: any, populate2?: any) => {
  const limit = Number(paginationQuery.limit) || null;
  const page = Number(paginationQuery.page) || 1;
  const skip = (page - 1) * limit;
  console.log(paginationQuery);
  if(populate2)
    return Model.find(filter , null, { limit, skip })
      .sort({ ['createdAt']:- 1 })
      .populate({
      path: populate1.path,
      select: populate1.select
    }).populate({
        path: populate2.path,
        select: populate2.select
    });
  else if(populate1)
    return Model.find(filter , null, { limit, skip })
      .sort({ ['createdAt']:- 1 })
      .populate({
        path: populate1.path,
        select: populate1.select
      })
  return Model.find(filter , null, { limit, skip }).sort({ ['createdAt']:- 1 });
}