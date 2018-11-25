# CityVis-China

This repository contains an information visualization of 20 major cities in China, originally as a cource project for [Data Visualization](http://vis.pku.edu.cn/wiki/doku.php?id=public_course:visclass_f18:assignment:start), Fall 2018 in Peking University.

## Dataset

All the data are collected from the Internet and are not guaranteed to be accurate. All available data types are summarized in the following table. For raw data, see `data.csv` in project root.

| Data                        | Type        | Metric                | Source           |
| --------------------------- | ----------- | --------------------- | ---------------- |
| City Overall Rank        | Ordinal Num | /                    | Baidu |
| Chinese Name                | String      | /                     | Common Knowledge |
| English Name                | String      | /                     | Common Knowledge |
| Location                    | 2D Vector   | (N,E)                 | Baidu            |
| Area                        | Ordinal Num | 10^4 KM^2             | Baidu            |
| Population                  | Ordinal Num | 10^4                  | Baidu            |
| GDP                         | Ordinal Num | 10^4 Yuan             | Wikipedia        |
| GDP per Capita              | Ordinal Num | 10^4 Yuan             | Baidu            |
| Income                      | Ordinal Num | Yuan                  | Baidu            |
| Life Expectancy             | Ordinal Num | Year                  | Wikipedia        |
| Salt Intake                 | Ordinal Num | g                     | Reference [1]    |
| Hypertension Incidence      | Ratio       | /                     | Baidu            |
| Zongzi(粽子) Perference     | Nominal     | {Salty, Sweet}        | Common Knowledge |
| Doufunao(豆腐脑) Perference | Nominal     | {Salty, Sweet, Spicy} | Common Knowledge |
| High-Speed Railway Network  | Graph       | /                     | Baidu |

## Methods



## References

1. Hipgrave, David B., et al. "Salt and sodium intake in China." *Jama* 315.7 (2016): 703-705.
2. Stevens, Stanley Smith. "On the theory of scales of measurement." (1946): 677-680.

