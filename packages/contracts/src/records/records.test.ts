import { describe, expect, it } from "vitest";

import {
  CURRENT_RECORDS_SCHEMA_VERSION,
  parseBaptismRecordCreate,
  parseBaptismRecordUpdate,
  parseBaptismRecordsListQuery,
  parseBaptismRecordsListResponse,
  parseFuneralRecordCreate,
  parseMarriageRecordCreate,
  parseMarriageRecordsListResponse,
} from "./index.js";

describe("@om/contracts sacramental record schemas", () => {
  it("exports an explicit records schema version", () => {
    expect(CURRENT_RECORDS_SCHEMA_VERSION).toBe(1);
  });

  it("validates baptism create payloads with OM snake_case field names", () => {
    const parsed = parseBaptismRecordCreate({
      church_id: 46,
      first_name: "John",
      last_name: "Doe",
      birth_date: "2010-05-01",
      reception_date: "2010-06-15",
      birthplace: "Boston, MA",
      entry_type: "Baptism",
      sponsors: "Jane Doe",
      parents: "Mary & Joseph Doe",
      clergy: "Fr. Michael",
    });

    expect(parsed).toMatchObject({
      church_id: 46,
      first_name: "John",
      last_name: "Doe",
      birth_date: "2010-05-01",
      clergy: "Fr. Michael",
    });
  });

  it("normalizes legacy camelCase baptism write input", () => {
    const parsed = parseBaptismRecordUpdate({
      firstName: "Anna",
      lastName: "Smith",
      dateOfBirth: "2001-01-02",
      baptismDate: "2001-02-03",
      priest: "Fr. Paul",
    });

    expect(parsed).toMatchObject({
      first_name: "Anna",
      last_name: "Smith",
      birth_date: "2001-01-02",
      reception_date: "2001-02-03",
      clergy: "Fr. Paul",
    });
  });

  it("rejects baptism create when required OM fields are missing", () => {
    expect(() =>
      parseBaptismRecordCreate({
        first_name: "John",
        last_name: "Doe",
        clergy: "Fr. Michael",
      }),
    ).toThrow();
  });

  it("validates marriage create payloads with OM field names", () => {
    const parsed = parseMarriageRecordCreate({
      church_id: 46,
      mdate: "2015-09-12",
      fname_groom: "George",
      lname_groom: "Papadopoulos",
      fname_bride: "Maria",
      lname_bride: "Nikolaou",
      parentsg: "Parents Groom",
      parentsb: "Parents Bride",
      witness: "John Witness",
      mlicense: "ML-123",
      clergy: "Fr. Andrew",
    });

    expect(parsed.fname_groom).toBe("George");
    expect(parsed.mdate).toBe("2015-09-12");
  });

  it("validates funeral create payloads with burial location canonical fields", () => {
    const parsed = parseFuneralRecordCreate({
      name: "Peter",
      lastname: "Ioannou",
      deceased_date: "2024-03-01",
      burial_date: "2024-03-05",
      age: "72",
      clergy: "Fr. Nicholas",
      burial_location: "Holy Trinity Cemetery",
      burial_location_id: 12,
    });

    expect(parsed).toMatchObject({
      name: "Peter",
      lastname: "Ioannou",
      deceased_date: "2024-03-01",
      age: 72,
      burial_location_id: 12,
    });
  });

  it("parses list query params aligned with portal recordsApi", () => {
    const parsed = parseBaptismRecordsListQuery({
      church_id: "46",
      page: "2",
      limit: "25",
      search: "smith",
      sortField: "reception_date",
      sortDirection: "desc",
    });

    expect(parsed).toEqual({
      church_id: 46,
      page: 2,
      limit: 25,
      search: "smith",
      sortField: "reception_date",
      sortDirection: "desc",
    });
  });

  it("unwraps OM list responses from records or data keys", () => {
    const baptism = parseBaptismRecordsListResponse({
      records: [
        {
          id: 1,
          church_id: 46,
          first_name: "John",
          last_name: "Doe",
          clergy: "Fr. Michael",
        },
      ],
      totalRecords: 1,
      currentPage: 1,
      totalPages: 1,
    });

    expect(baptism.rows).toHaveLength(1);
    expect(baptism.meta.totalRecords).toBe(1);

    const marriage = parseMarriageRecordsListResponse({
      data: [
        {
          id: 2,
          church_id: 46,
          fname_groom: "A",
          lname_groom: "B",
          fname_bride: "C",
          lname_bride: "D",
          clergy: "Fr. Andrew",
        },
      ],
      total: 1,
      page: 1,
    });

    expect(marriage.rows[0]?.id).toBe(2);
    expect(marriage.meta.currentPage).toBe(1);
  });
});
