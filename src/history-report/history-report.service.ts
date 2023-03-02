import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UploadService } from '../upload/upload.service';
import { Model } from 'mongoose';
import {
  HistoryReport,
  HistoryReportDocument,
} from '../schemas/history-report';
import { LANGUAGE, SORT_AGGREGATE } from '../common/constants';
import { User, UserDocument } from '~/schemas';
import { isMongoId } from 'class-validator';

@Injectable()
export class HistoryReportService {
  constructor(
    private uploadService: UploadService,
    @InjectModel(HistoryReport.name)
    private historicalReportModel: Model<HistoryReportDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  async create(file, userId, language) {
    const resultUpdate = await this.uploadService.uploadFileS3(
      file,
      process.env.HISTORY_REPORT_FOLDER,
    );

    const report = await this.historicalReportModel.create({
      updateBy: userId,
      historyReportUrl: resultUpdate.data,
      language,
    });
    return report;
  }

  async findOne(language) {
    const reportHistory = await this.historicalReportModel
      .findOne({ language })
      .sort({ createdAt: SORT_AGGREGATE.DESC })
      .limit(1);
    if (!reportHistory) return { language };
    if (!isMongoId(reportHistory.updateBy)) return reportHistory;
    const user = await this.userModel.findOne({ _id: reportHistory.updateBy });
    reportHistory.updateBy = user?.username;
    return reportHistory;
  }

  async getHistoryReport() {
    const languages = Object.values(LANGUAGE);
    const historyReports = await Promise.all(
      languages.map((language) => this.findOne(language)),
    );
    const en = historyReports.find(
      (historyReport) => historyReport.language === LANGUAGE.EN,
    );
    const jp = historyReports.find(
      (historyReport) => historyReport.language === LANGUAGE.JP,
    );
    const cn = historyReports.find(
      (historyReport) => historyReport.language === LANGUAGE.CN,
    );
    return {
      en,
      jp,
      cn,
    };
  }
}
