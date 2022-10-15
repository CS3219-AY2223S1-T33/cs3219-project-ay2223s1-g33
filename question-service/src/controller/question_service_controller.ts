import { ServiceDefinition } from '@grpc/grpc-js';
import { IQuestionService, questionServiceDefinition } from '../proto/question-service.grpc-server';
import {
  CreateQuestionRequest,
  CreateQuestionResponse,
  DeleteQuestionRequest,
  DeleteQuestionResponse,
  EditQuestionRequest,
  EditQuestionResponse,
  GetQuestionRequest,
  GetQuestionResponse,
} from '../proto/question-service';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import GetQuestionHandler from './question_service_handlers/get_question_handler';
import { IStorage } from '../storage/storage.d';
import CreateQuestionHandler from './question_service_handlers/create_question_handler';
import EditQuestionHandler from './question_service_handlers/edit_question_handler';
import DeleteQuestionHandler from './question_service_handlers/delete_question_handler';

class QuestionServiceApi implements ApiService<IQuestionService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IQuestionService>;

  serviceDefinition: ServiceDefinition<IQuestionService>;

  serviceImplementation: IQuestionService;

  constructor(storage: IStorage, redisStream: IStreamProducer) {
    const handlerDefinitions: ServiceHandlerDefinition<IQuestionService> = {
      getQuestion: fromApiHandler(
        new GetQuestionHandler(storage),
        GetQuestionRequest,
        GetQuestionResponse,
      ),
      createQuestion: fromApiHandler(
        new CreateQuestionHandler(storage),
        CreateQuestionRequest,
        CreateQuestionResponse,
      ),
      editQuestion: fromApiHandler(
        new EditQuestionHandler(storage),
        EditQuestionRequest,
        EditQuestionResponse,
      ),
      deleteQuestion: fromApiHandler(
        new DeleteQuestionHandler(storage, redisStream),
        DeleteQuestionRequest,
        DeleteQuestionResponse,
      ),
    };

    const questionService: IQuestionService = {
      getQuestion: handlerDefinitions.getQuestion.grpcRouteHandler,
      createQuestion: handlerDefinitions.createQuestion.grpcRouteHandler,
      editQuestion: handlerDefinitions.editQuestion.grpcRouteHandler,
      deleteQuestion: handlerDefinitions.deleteQuestion.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = questionServiceDefinition;
    this.serviceImplementation = questionService;
  }
}

export default QuestionServiceApi;
